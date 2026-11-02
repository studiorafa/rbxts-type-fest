import { strict as assert } from "node:assert";
import { test } from "node:test";
import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
	generatedFiles,
	integrity,
	replaceGenerated,
	stablePair,
	temporary,
	upstreamRelease,
} from "../scripts/common";
import { matrix, Report } from "../scripts/compatibility";
import { coverage, removedExports } from "../scripts/report";
import { validateReport } from "../scripts/verify";

const digest = "sha512-" + Buffer.alloc(64, 1).toString("base64");
function fixture() {
	const report: Report = {
		upstream: { version: "5.10.0", integrity: digest },
		toolchain: matrix,
		exports: [{ name: "Good", status: "supported", source: "source/good.d.ts", adaptations: [] }],
		removed: [],
		unsupportedEntrypoints: { "/globals": "Ambient augmentation" },
	};
	const manifest = {
		name: "@rbxts/type-fest",
		version: "5.10.0",
		types: "src/index.d.ts",
		dependencies: {},
	};
	const lock = { version: manifest.version, packages: { "": { ...manifest } } };
	return { report, manifest, lock };
}

test("registry validation rejects malformed versions, artifacts and release pairs", () => {
	const release = {
		name: "type-fest",
		version: "5.10.0",
		dist: { integrity: digest, tarball: "https://registry.npmjs.org/type-fest/-/type-fest-5.10.0.tgz" },
	};
	assert.deepEqual(upstreamRelease(release), { version: "5.10.0", integrity: digest });
	for (const value of [null, "sha512-test", "sha512-" + "A".repeat(88)])
		assert.throws(() => integrity(value));
	assert.throws(() => upstreamRelease({ ...release, name: "other" }));
	assert.throws(() =>
		upstreamRelease({ ...release, dist: { ...release.dist, tarball: "https://example.com/other.tgz" } }),
	);
	assert.deepEqual(
		stablePair({
			"dist-tags": { latest: "5.10.0" },
			versions: { "5.9.0": {}, "5.10.0": {}, "6.0.0-beta.1": {} },
		}),
		{ latest: "5.10.0", previous: "5.9.0" },
	);
	assert.throws(() => stablePair({ "dist-tags": { latest: "5.10.0" }, versions: {} }));
});

test("package verification rejects disagreement between shipped API, metadata and documentation", () => {
	const { report, manifest, lock } = fixture();
	const readme = coverage(report);
	assert.doesNotThrow(() => validateReport(report, manifest, lock, readme, ["Good"]));
	assert.throws(() => validateReport(report, manifest, lock, readme, ["Other"]));
	assert.throws(() =>
		validateReport(report, { ...manifest, main: "out/index.lua" }, lock, readme, ["Good"]),
	);
	assert.throws(() => validateReport(report, manifest, { ...lock, version: "5.9.0" }, readme, ["Good"]));
	assert.throws(() => validateReport(report, manifest, lock, readme.replace("1/1", "2/2"), ["Good"]));
	const omitted = {
		...report,
		exports: [
			...report.exports,
			{
				name: "Bad",
				status: "omitted" as const,
				source: "source/bad.d.ts",
				adaptations: [],
				reason: "Missing Date",
			},
		],
	};
	assert.throws(() => validateReport(omitted, manifest, lock, coverage(omitted), ["Good"]));
	assert.throws(() => validateReport({ ...report, removed: ["Good"] }, manifest, lock, readme, ["Good"]));
});

test("removal notices survive regeneration and clear when an export returns", () => {
	const { report } = fixture();
	const omitted = [
		{
			...report.exports[0],
			status: "omitted" as const,
			reason: "Missing Date",
			dependencyTrace: ["Good"],
		},
	];
	assert.deepEqual(removedExports(report, omitted), ["Good"]);
	assert.deepEqual(removedExports({ ...report, exports: omitted, removed: ["Good"] }, omitted), ["Good"]);
	assert.deepEqual(removedExports({ ...report, exports: omitted, removed: ["Good"] }, report.exports), []);
});

test("replacement restores all generated paths after a partial copy failure", async () =>
	temporary(async (directory) => {
		const stage = path.join(directory, "stage"),
			target = path.join(directory, "target");
		for (const base of [stage, target]) {
			await mkdir(path.join(base, "src"), { recursive: true });
			for (const name of generatedFiles.filter((name) => name !== "src"))
				await writeFile(path.join(base, name), base === stage ? "new" : "old");
			await writeFile(
				path.join(base, "src", base === stage ? "new.d.ts" : "old.d.ts"),
				base === stage ? "new" : "old",
			);
		}
		let copies = 0;
		await assert.rejects(
			replaceGenerated(stage, target, async (...args: Parameters<typeof cp>) => {
				await cp(...args);
				if (++copies === 3) throw Error("Simulated partial copy failure");
			}),
			/partial copy failure/,
		);
		for (const name of generatedFiles.filter((name) => name !== "src"))
			assert.equal(await readFile(path.join(target, name), "utf8"), "old");
		assert.deepEqual(await readdir(path.join(target, "src")), ["old.d.ts"]);
		assert.deepEqual((await readdir(target)).sort(), [...generatedFiles].sort());
		await replaceGenerated(stage, target);
		assert.deepEqual(await readdir(path.join(target, "src")), ["new.d.ts"]);
		assert.equal(await readFile(path.join(target, "package.json"), "utf8"), "new");
	}));
