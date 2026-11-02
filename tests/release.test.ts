import { test } from "node:test";
import { strict as assert } from "node:assert";
import { assertPublished, ReleaseOperations, runRelease } from "../scripts/release";

const target = "5.10.0",
	digest = "sha512-" + Buffer.alloc(64, 1).toString("base64");
const published = {
	name: "@rbxts/type-fest",
	version: target,
	repository: { url: "git+https://github.com/studiorafa/rbxts-type-fest.git" },
	dist: { integrity: digest },
};
function harness(reads: (Record<string, unknown> | undefined | Error)[]) {
	const events: string[] = [],
		pauses: number[] = [];
	let index = 0;
	const operations: ReleaseOperations = {
		readPublished: async () => {
			events.push("read");
			const value = reads[Math.min(index++, reads.length - 1)];
			if (value instanceof Error) throw value;
			return value;
		},
		readTag: async () => {
			events.push("tag");
			return target;
		},
		generate: async () => {
			events.push("generate");
		},
		verify: async () => {
			events.push("verify");
			return { tarball: "verified.tgz", integrity: digest };
		},
		commitAndPush: () => {
			events.push("push");
		},
		publish: (tarball) => {
			assert.equal(tarball, "verified.tgz");
			events.push("publish");
		},
		verifyInstalled: async (integrity) => {
			assert.equal(integrity, digest);
			events.push("install");
		},
		pause: async (milliseconds) => {
			pauses.push(milliseconds);
		},
	};
	return { operations, events, pauses };
}

test("fresh and already-committed releases verify, push and publish exactly the tested artifact", async () => {
	for (const local of ["5.9.0", target]) {
		const { operations, events } = harness([undefined, undefined, published]);
		assert.equal(await runRelease(target, local, operations), "published");
		assert.deepEqual(events, [
			"read",
			"generate",
			"verify",
			"push",
			"read",
			"publish",
			"read",
			"tag",
			"install",
		]);
	}
});

test("matching existing publication is a verified installed no-op", async () => {
	const { operations, events } = harness([published]);
	assert.equal(await runRelease(target, target, operations), "noop");
	assert.deepEqual(events, ["read", "verify", "tag", "install"]);
});

test("verification failures and rejected pushes prevent publication", async () => {
	for (const boundary of ["generate", "verify", "commitAndPush"] as const) {
		const { operations, events } = harness([undefined]);
		operations[boundary] = () => {
			throw Error(`Failed ${boundary}`);
		};
		await assert.rejects(runRelease(target, target, operations), /Failed/);
		assert.equal(events.includes("publish"), false);
		assert.equal(events.includes("install"), false);
	}
});

test("concurrent publication is checked without a second publish", async () => {
	const { operations, events } = harness([undefined, published]);
	assert.equal(await runRelease(target, "5.9.0", operations), "concurrent");
	assert.equal(events.includes("publish"), false);
	assert.equal(events.at(-1), "install");
});

test("ambiguous publish and delayed registry visibility retry reads, never publication", async () => {
	const { operations, events, pauses } = harness([
		undefined,
		undefined,
		new Error("Network unavailable"),
		undefined,
		published,
	]);
	operations.publish = () => {
		events.push("publish");
		throw Error("Connection closed after upload");
	};
	assert.equal(await runRelease(target, target, operations), "published");
	assert.equal(events.filter((event) => event === "publish").length, 1);
	assert.deepEqual(pauses, [1000, 2000]);
	assert.equal(events.at(-1), "install");
});

test("an unconfirmed successful publish fails after bounded polling", async () => {
	const { operations, events, pauses } = harness([undefined]);
	await assert.rejects(runRelease(target, target, operations), /could not be confirmed/);
	assert.equal(events.filter((event) => event === "publish").length, 1);
	assert.deepEqual(pauses, [1000, 2000, 4000]);
	assert.equal(events.includes("install"), false);
});

test("mismatched publications stop at initial, concurrent and post-publish checks", async () => {
	for (const bad of [
		{ ...published, version: "5.9.0" },
		{ ...published, name: "other" },
		{ ...published, dist: { integrity: "wrong" } },
		{ ...published, repository: { url: "https://github.com/other/repo" } },
	]) {
		for (const reads of [[bad], [undefined, bad], [undefined, undefined, bad]]) {
			const { operations, events } = harness(reads);
			await assert.rejects(runRelease(target, target, operations), /disagrees/);
			assert.equal(events.includes("install"), false);
		}
	}
});

test("wrong dist-tag and failed installation do not report a successful release", async () => {
	const first = harness([published]);
	first.operations.readTag = async () => "5.9.0";
	await assert.rejects(runRelease(target, target, first.operations), /dist-tag/);
	assert.equal(first.events.includes("install"), false);
	const second = harness([published]);
	second.operations.verifyInstalled = async () => {
		throw Error("Consumer compile failed");
	};
	await assert.rejects(runRelease(target, target, second.operations), /Consumer compile failed/);
});
test("ambiguous publication accepts only matching integrity and repository", () => {
	const good = {
		name: "@rbxts/type-fest",
		version: "5.10.0",
		repository: { url: "git+https://github.com/studiorafa/rbxts-type-fest.git" },
		dist: { integrity: "sha512-test" },
	};
	assert.doesNotThrow(() => assertPublished(good, "sha512-test", "5.10.0"));
	assert.throws(() => assertPublished(good, "sha512-other", "5.10.0"));
	assert.throws(() =>
		assertPublished(
			{ ...good, repository: { url: "https://github.com/other/repo" } },
			"sha512-test",
			"5.10.0",
		),
	);
});
