import { execFileSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import semver from "semver";
export const root = path.resolve(__dirname, "..");
export const registry = "https://registry.npmjs.org/";
export function command(executable: string, args: string[], cwd = root, env = process.env): string {
	return execFileSync(executable, args, {
		cwd,
		env,
		encoding: "utf8",
		timeout: 300000,
		maxBuffer: 32 * 1024 * 1024,
		stdio: ["ignore", "pipe", "pipe"],
	}).trim();
}
// Invoke npm's JavaScript entry point directly, including on Windows (no shell interpolation).
export function npm(args: string[], cwd = root, env = process.env): string {
	const cli =
		process.env.npm_execpath ||
		path.resolve(path.dirname(process.execPath), "node_modules/npm/bin/npm-cli.js");
	return command(process.execPath, [cli, ...args], cwd, env);
}
export async function json<T = unknown>(file: string): Promise<T> {
	return JSON.parse(await readFile(file, "utf8")) as T;
}
export function exactVersion(value: unknown): string {
	if (typeof value !== "string" || semver.valid(value) !== value || semver.prerelease(value))
		throw Error(`Expected exact stable semantic version: ${String(value)}`);
	return value;
}
export function object(value: unknown): Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw Error("Expected an object");
	return value as Record<string, unknown>;
}
export function integrity(value: unknown): string {
	if (
		typeof value !== "string" ||
		!/^sha512-[A-Za-z0-9+/]{86}==$/.test(value) ||
		Buffer.from(value.slice(7), "base64").toString("base64") !== value.slice(7)
	)
		throw Error("Expected canonical SHA-512 artifact integrity");
	return value;
}
export function upstreamRelease(value: unknown): { version: string; integrity: string } {
	const release = object(value),
		dist = object(release.dist);
	const version = exactVersion(release.version);
	if (release.name !== "type-fest") throw Error("Unexpected upstream package name");
	if (typeof dist.tarball !== "string") throw Error("Missing upstream tarball");
	const url = new URL(dist.tarball);
	if (
		url.origin !== registry.slice(0, -1) ||
		url.username ||
		url.password ||
		url.pathname !== `/type-fest/-/type-fest-${version}.tgz` ||
		url.search ||
		url.hash
	)
		throw Error("Unexpected upstream tarball URL");
	return { version, integrity: integrity(dist.integrity) };
}
export function stablePair(value: unknown): { latest: string; previous: string } {
	const packument = object(value),
		versions = object(packument.versions);
	const latest = exactVersion(object(packument["dist-tags"]).latest);
	if (!Object.hasOwn(versions, latest))
		throw Error("Latest stable version is missing from registry versions");
	const previous = Object.keys(versions)
		.filter((v) => semver.valid(v) === v && !semver.prerelease(v) && semver.lt(v, latest))
		.sort(semver.rcompare)[0];
	return { latest, previous: exactVersion(previous) };
}

export const generatedFiles = [
	"src",
	"package.json",
	"package-lock.json",
	"compatibility.json",
	"README.md",
	"LICENSE",
	"docs/compatibility.md",
];
// Back up every fixed generated path before touching any of them. Keep the backup if restoration fails.
export async function replaceGenerated(stage: string, directory = root, copy = cp): Promise<void> {
	const base = path.resolve(directory);
	const target = (name: string) => {
		const resolved = path.resolve(base, name);
		const relative = path.relative(base, resolved);
		if (!relative || relative.startsWith("..") || path.isAbsolute(relative))
			throw Error("Unsafe generated target");
		return resolved;
	};
	const backup = await mkdtemp(path.join(base, ".sync-backup-"));
	const saved: string[] = [],
		touched: string[] = [];
	let cleanup = true;
	try {
		for (const name of generatedFiles) {
			try {
				await cp(target(name), path.join(backup, name), { recursive: true });
				saved.push(name);
			} catch (error) {
				if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
			}
		}
		try {
			for (const name of generatedFiles) {
				touched.push(name);
				await rm(target(name), { recursive: true, force: true });
				await mkdir(path.dirname(target(name)), { recursive: true });
				await copy(path.join(stage, name), target(name), { recursive: true });
			}
		} catch (error) {
			try {
				for (const name of touched.reverse()) {
					await rm(target(name), { recursive: true, force: true });
					if (saved.includes(name))
						await cp(path.join(backup, name), target(name), { recursive: true });
				}
			} catch (restoreError) {
				cleanup = false;
				throw new AggregateError([error, restoreError], `Restore generated files from ${backup}`);
			}
			throw error;
		}
	} finally {
		if (cleanup && path.dirname(backup) === base && path.basename(backup).startsWith(".sync-backup-"))
			await rm(backup, { recursive: true, force: true });
	}
}
export async function metadata(name: string, version?: string): Promise<Record<string, unknown> | undefined> {
	const response = await fetch(
		registry + encodeURIComponent(name) + (version ? "/" + encodeURIComponent(version) : ""),
		{ signal: AbortSignal.timeout(30000) },
	);
	if (response.status === 404) return undefined;
	if (!response.ok) throw Error(`Registry returned ${response.status} for ${name}`);
	const value: unknown = await response.json();
	if (!value || typeof value !== "object" || Array.isArray(value)) throw Error("Invalid registry response");
	return value as Record<string, unknown>;
}
export async function temporary<T>(fn: (directory: string) => Promise<T>): Promise<T> {
	const directory = await mkdtemp(path.join(tmpdir(), "rbxts-type-fest-"));
	try {
		return await fn(directory);
	} finally {
		if (path.dirname(directory) !== tmpdir() || !path.basename(directory).startsWith("rbxts-type-fest-"))
			throw Error("Unsafe temporary cleanup path");
		await rm(directory, { recursive: true, force: true });
	}
}
export function failure(error: unknown): void {
	const e = error as { message?: string; stdout?: Buffer | string; stderr?: Buffer | string };
	// Never print subprocess environment or credentials.
	console.error(e.message?.split("\n")[0] ?? "Operation failed");
	if (e.stdout) console.error(String(e.stdout));
	if (e.stderr) console.error(String(e.stderr));
	process.exitCode = 1;
}
