import path from "node:path";
import { appendFile } from "node:fs/promises";
import { command, failure, generatedFiles, json, metadata, npm, root, stablePair } from "./common";
import type { Report } from "./compatibility";
import { sync } from "./sync";
import { verify, verifyConsumer } from "./verify";

const packageName = "@rbxts/type-fest";
const repository = "https://github.com/studiorafa/rbxts-type-fest";
export function assertPublished(value: Record<string, unknown>, integrity: string, version: string): void {
	const repo = value.repository as { url?: unknown } | undefined;
	const dist = value.dist as { integrity?: unknown } | undefined;
	if (
		typeof repo?.url !== "string" ||
		repo.url.replace(/^git\+/, "").replace(/\.git$/, "") !== repository ||
		dist?.integrity !== integrity ||
		value.name !== packageName ||
		value.version !== version
	)
		throw Error("Existing publication disagrees with package, version, repository or tarball integrity");
}

export interface ReleaseOperations {
	readPublished(): Promise<Record<string, unknown> | undefined>;
	readTag(): Promise<unknown>;
	generate(): Promise<void>;
	verify(): Promise<{ tarball: string; integrity: string }>;
	commitAndPush(): void;
	publish(tarball: string): void;
	verifyInstalled(integrity: string): Promise<void>;
	pause(milliseconds: number): Promise<void>;
}

// External effects are supplied here so tests exercise the same ordering as a real release.
export async function runRelease(
	target: string,
	local: string,
	operations: ReleaseOperations,
): Promise<"noop" | "published" | "concurrent"> {
	const existing = await operations.readPublished();
	if (existing && local !== target)
		throw Error("Published target exists but repository is not aligned; reconcile repository state");
	if (!existing) await operations.generate(); // Also reproduce already committed, unpublished versions.
	const packed = await operations.verify();
	let outcome: "noop" | "published" | "concurrent" = "noop";
	if (existing) assertPublished(existing, packed.integrity, target);
	else {
		operations.commitAndPush(); // A rejected push must prevent every publication attempt.
		const raced = await operations.readPublished();
		if (raced) {
			assertPublished(raced, packed.integrity, target);
			outcome = "concurrent";
		} else {
			let publishError: unknown;
			try {
				operations.publish(packed.tarball);
			} catch (error) {
				publishError = error;
			}
			let confirmed = false;
			for (let attempt = 0; attempt < 4; attempt++) {
				if (attempt) await operations.pause(1000 * 2 ** (attempt - 1));
				let published: Record<string, unknown> | undefined;
				try {
					published = await operations.readPublished();
				} catch (error) {
					publishError ??= error;
					continue;
				}
				if (!published) continue;
				assertPublished(published, packed.integrity, target);
				confirmed = true;
				break;
			}
			if (!confirmed)
				throw new Error(`Publication of ${target} could not be confirmed; retry the same version`, {
					cause: publishError,
				});
			outcome = "published";
		}
	}
	let tagConfirmed = false;
	for (let attempt = 0; attempt < 4; attempt++) {
		if (attempt) await operations.pause(1000 * 2 ** (attempt - 1));
		try {
			if ((await operations.readTag()) === target) {
				tagConfirmed = true;
				break;
			}
		} catch {
			/* A bounded retry handles registry visibility and transport delays. */
		}
	}
	if (!tagConfirmed) throw Error(`Registry dist-tag does not identify verified ${target}`);
	await operations.verifyInstalled(packed.integrity);
	return outcome;
}

async function summary(message: string): Promise<void> {
	console.log(message);
	if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, message + "\n");
}

async function release(): Promise<void> {
	if (
		process.env.GITHUB_ACTIONS !== "true" ||
		process.env.GITHUB_REPOSITORY !== "studiorafa/rbxts-type-fest" ||
		process.env.GITHUB_REF !== "refs/heads/main"
	)
		throw Error("Releases must run from the repository's main branch in GitHub Actions");
	const bootstrap = process.env.BOOTSTRAP === "true";
	if (!bootstrap && process.env.PUBLISH_ENABLED !== "true") {
		await summary("Publishing disabled. Set PUBLISH_ENABLED=true after trusted publisher setup.");
		return;
	}
	if (bootstrap && !process.env.NODE_AUTH_TOKEN)
		throw Error("Bootstrap requires the NPM_TOKEN Actions secret");
	const upstream = await metadata("type-fest");
	if (!upstream) throw Error("Upstream package not found");
	const { latest, previous } = stablePair(upstream),
		target = bootstrap ? previous : latest;
	if (bootstrap && (await metadata(packageName))) throw Error("Bootstrap rejected: package already exists");
	// Verify latest in staging without first changing main to an unpublished intermediate API.
	if (bootstrap) await sync(latest, false, path.join(root, "artifacts"));
	const local = await json<{ version: string }>(path.join(root, "package.json"));
	const tag = bootstrap ? "bootstrap" : "latest";
	const outcome = await runRelease(target, local.version, {
		readPublished: () => metadata(packageName, target),
		readTag: async () =>
			((await metadata(packageName))?.["dist-tags"] as Record<string, unknown> | undefined)?.[tag],
		generate: () => sync(target),
		verify,
		commitAndPush: () => {
			if (command("git", ["diff", "--cached", "--name-only"]))
				throw Error("Unexpected pre-staged changes in release checkout");
			command("git", ["add", "--", ...generatedFiles]);
			if (command("git", ["diff", "--cached", "--name-only"]))
				command("git", [
					"-c",
					"user.name=github-actions[bot]",
					"-c",
					"user.email=41898282+github-actions[bot]@users.noreply.github.com",
					"commit",
					"-m",
					`chore: sync type-fest ${target}`,
				]);
			command("git", ["push", "origin", "HEAD:main"]);
		},
		publish: (tarball) =>
			npm([
				"publish",
				tarball,
				"--access",
				"public",
				"--tag",
				tag,
				"--ignore-scripts",
				"--registry=https://registry.npmjs.org/",
			]),
		verifyInstalled: async (integrity) =>
			verifyConsumer(
				`${packageName}@${target}`,
				await json<Report>(path.join(root, "compatibility.json")),
				integrity,
			),
		pause: (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
	});
	const report = await json<Report>(path.join(root, "compatibility.json"));
	await summary(
		`${outcome === "noop" ? "Verified no-op for" : outcome === "concurrent" ? "Verified concurrent publication of" : "Published and installed"} **${packageName}@${target}**.\n\nRemoved exports: ${report.removed.join(", ") || "none"}.\n\n` +
			report.exports
				.filter((entry) => entry.status === "omitted")
				.map((entry) => `- ${entry.name}: ${entry.reason}`)
				.join("\n"),
	);
}

if (require.main === module) release().catch(failure);
