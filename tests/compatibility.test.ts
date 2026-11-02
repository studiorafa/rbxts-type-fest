import { strict as assert } from "node:assert";
import { test } from "node:test";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { temporary, exactVersion } from "../scripts/common";
import { generate, diagnostics } from "../scripts/compatibility";

test("exact versions reject ranges and prereleases", () => {
	assert.equal(exactVersion("5.10.0"), "5.10.0");
	for (const v of ["^5.0.0", "5.0.0-beta.1", null, "../x"]) assert.throws(() => exactVersion(v));
});
test("declaration slicing preserves siblings, aliases, barrels, cycles and PropertyKey", async () =>
	temporary(async (dir) => {
		const upstream = path.join(dir, "upstream"),
			out = path.join(dir, "out");
		await mkdir(path.join(upstream, "nested"), { recursive: true });
		await mkdir(out);
		await writeFile(
			path.join(upstream, "index.d.ts"),
			'export type {Good as Renamed, Bad, KeyRecord, CycleA} from "./nested/barrel.d.ts";',
		);
		await writeFile(path.join(upstream, "nested/barrel.d.ts"), 'export type * from "./a.d.ts";');
		await writeFile(
			path.join(upstream, "nested/a.d.ts"),
			'import type {CycleB} from "./b.d.ts"; export type Good = {a:string}; export type Bad = Date; export type KeyRecord = Record<PropertyKey, unknown>; export interface CycleA {next?:CycleB}',
		);
		await writeFile(
			path.join(upstream, "nested/b.d.ts"),
			'import type {CycleA} from "./a.d.ts"; export interface CycleB {next?:CycleA}',
		);
		const decisions = await generate(upstream, out);
		assert.equal(decisions.find((e) => e.name === "Bad")?.status, "omitted");
		assert.match(decisions.find((e) => e.name === "Bad")!.reason!, /Date/);
		assert.equal(decisions.find((e) => e.name === "KeyRecord")?.status, "adapted");
		assert.equal(decisions.find((e) => e.name === "Renamed")?.status, "supported");
		assert.equal(diagnostics([path.join(out, "index.d.ts")]).length, 0);
		assert.doesNotMatch(await readFile(path.join(out, "nested/a.d.ts"), "utf8"), /type Bad/);
	}));

test("root declarations and inline aliases retain reachable helpers and reject broken exports", async () =>
	temporary(async (dir) => {
		const upstream = path.join(dir, "upstream"),
			out = path.join(dir, "out");
		await mkdir(upstream);
		await mkdir(out);
		await writeFile(
			path.join(upstream, "index.d.ts"),
			`
export type Direct = {id:1};
type PropertyKey = keyof any;
export type NativeKey = PropertyKey;
export type Inline = import("./barrel.d.ts").Renamed;
export type BackRef = import("./helpers.d.ts").Back;
export type InlineBad = import("./helpers.d.ts").Bad;
export type Missing = import("./absent.d.ts").Absent;
export type {NoSuch} from "./helpers.d.ts";
export type Length<T extends unknown[]> = T["length"];
declare global {interface FakeWindow {value:string}}
export type Augmented = FakeWindow;
`,
		);
		await writeFile(
			path.join(upstream, "barrel.d.ts"),
			'export type {Good as Renamed} from "./helpers.d.ts";',
		);
		await writeFile(
			path.join(upstream, "helpers.d.ts"),
			'export type Good = {value:2}; export type Bad = Date; export type Back = import("./index.d.ts").Direct;',
		);
		const decisions = await generate(upstream, out);
		for (const name of ["Direct", "Inline", "BackRef", "NativeKey"])
			assert.equal(decisions.find((entry) => entry.name === name)?.status, "supported", name);
		for (const name of ["InlineBad", "Missing", "NoSuch", "Length", "Augmented"])
			assert.equal(decisions.find((entry) => entry.name === name)?.status, "omitted", name);
		assert.match(
			decisions.find((entry) => entry.name === "InlineBad")!.dependencyTrace!.join(" -> "),
			/helpers\.d\.ts#Bad/,
		);
		await writeFile(
			path.join(dir, "assertions.ts"),
			`import type {Direct,Inline,BackRef} from "./out/index.d.ts";
type Expect<T extends true> = T;
type A = Expect<Direct extends {id:1} ? true : false>;
type B = Expect<Inline extends {value:2} ? true : false>;
type C = Expect<BackRef extends Direct ? true : false>;
`,
		);
		assert.deepEqual(
			diagnostics([path.join(dir, "assertions.ts")]).map((entry) => entry.messageText),
			[],
		);
		assert.doesNotMatch(await readFile(path.join(out, "index.d.ts"), "utf8"), /from "\.\/index\.d\.ts"/);
		assert.doesNotMatch(
			await readFile(path.join(out, "upstream-index.d.ts"), "utf8"),
			/FakeWindow|declare global/,
		);
	}));

test("semantic regressions and missing modules omit only affected exports", async () =>
	temporary(async (dir) => {
		const upstream = path.join(dir, "upstream"),
			out = path.join(dir, "out");
		await mkdir(upstream);
		await mkdir(out);
		await writeFile(
			path.join(upstream, "index.d.ts"),
			'export type {Merge, Good, Missing} from "./types.d.ts";',
		);
		await writeFile(
			path.join(upstream, "types.d.ts"),
			'import type {Unavailable} from "not-a-real-package"; export type Merge<A,B> = A & B; export type Good = string; export type Missing = Unavailable;',
		);
		const decisions = await generate(upstream, out);
		assert.equal(decisions.find((d) => d.name === "Good")?.status, "supported");
		assert.match(decisions.find((d) => d.name === "Merge")?.reason ?? "", /Expected-result/);
		assert.match(decisions.find((d) => d.name === "Missing")?.reason ?? "", /not-a-real-package/);
		assert.equal(diagnostics([path.join(out, "index.d.ts")]).length, 0);
	}));
