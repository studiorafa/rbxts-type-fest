import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";
import { createHash } from "node:crypto";
import { command, exactVersion, failure, integrity, json, npm, root, temporary } from "./common";
import { core, diagnostics, diagnosticText, matrix, options, Report } from "./compatibility";
import { semantics } from "./expectations";
import { coverage } from "./report";

export async function checkToolchain(): Promise<void> {
	if (process.versions.node.split(".")[0] !== "24") throw Error("Verification requires Node 24");
	if (npm(["--version"]) !== "11.19.0") throw Error("Verification requires npm 11.19.0");
	for (const [name, version] of Object.entries(matrix)) {
		const installed = await json<{ version: string }>(
			path.join(root, "node_modules", name, "package.json"),
		);
		if (installed.version !== version) throw Error(`Toolchain mismatch: ${name} must be ${version}`);
	}
}

export function validateReport(
	report: Report,
	manifest: Record<string, unknown>,
	lock: Record<string, unknown>,
	readme: string,
	actualExports: string[],
): void {
	exactVersion(report.upstream.version);
	integrity(report.upstream.integrity);
	if (
		manifest.name !== "@rbxts/type-fest" ||
		manifest.version !== report.upstream.version ||
		manifest.types !== "src/index.d.ts" ||
		"main" in manifest ||
		"module" in manifest ||
		"bin" in manifest
	)
		throw Error("Package identity, version or declaration-only entry point disagrees with report");
	const rootLock = (lock.packages as Record<string, Record<string, unknown>>)?.[""];
	if (
		lock.version !== manifest.version ||
		rootLock?.version !== manifest.version ||
		rootLock?.name !== manifest.name ||
		JSON.stringify(rootLock?.dependencies ?? {}) !== JSON.stringify(manifest.dependencies ?? {})
	)
		throw Error("Package lock disagrees with manifest");
	if (JSON.stringify(report.toolchain) !== JSON.stringify(matrix))
		throw Error("Compatibility toolchain differs from verified matrix");
	const names = report.exports.map((entry) => entry.name);
	if (!names.length || names.length !== new Set(names).size) throw Error("Invalid export coverage");
	for (const entry of report.exports) {
		if (
			!entry.source ||
			!Array.isArray(entry.adaptations) ||
			!["supported", "adapted", "omitted"].includes(entry.status)
		)
			throw Error(`Invalid export classification: ${entry.name}`);
		if (
			entry.status === "omitted" &&
			(!entry.reason || /[\r\n]/.test(entry.reason) || !entry.dependencyTrace?.length)
		)
			throw Error(`Omission lacks a single-line reason or dependency trace: ${entry.name}`);
		if ((entry.status === "adapted") !== entry.adaptations.length > 0)
			throw Error(`Invalid adaptation classification: ${entry.name}`);
		if (entry.adaptations.some((rule) => rule !== "property-key"))
			throw Error(`Unverified adaptation: ${entry.name}`);
	}
	const available = report.exports
		.filter((entry) => entry.status !== "omitted")
		.map((entry) => entry.name)
		.sort();
	if (!available.length || JSON.stringify(available) !== JSON.stringify([...actualExports].sort()))
		throw Error("Shipped exports disagree with compatibility report");
	if (
		report.removed.length !== new Set(report.removed).size ||
		report.removed.some((name) => available.includes(name))
	)
		throw Error("Invalid API removal notice");
	if (!report.unsupportedEntrypoints["/globals"])
		throw Error("Missing unsupported globals entry point notice");
	const normalized = readme.replaceAll("\r\n", "\n");
	if (
		normalized.match(/<!-- coverage:start -->/g)?.length !== 1 ||
		normalized.match(/<!-- coverage:end -->/g)?.length !== 1 ||
		normalized.match(/<!-- coverage:start -->[\s\S]*?<!-- coverage:end -->/)?.[0] !== coverage(report)
	)
		throw Error("README coverage disagrees with compatibility report");
}

export async function verify(directory = root): Promise<{ tarball: string; integrity: string }> {
	await checkToolchain();
	const report = await json<Report>(path.join(directory, "compatibility.json"));
	const names = report.exports.filter((e) => e.status !== "omitted").map((e) => e.name);
	const entry = path.join(directory, "src/index.d.ts");
	const program = ts.createProgram([core, entry], options),
		checker = program.getTypeChecker();
	const actualExports = checker
		.getExportsOfModule(checker.getSymbolAtLocation(program.getSourceFile(entry)!)!)
		.map((symbol) => symbol.name);
	validateReport(
		report,
		await json(path.join(directory, "package.json")),
		await json(path.join(directory, "package-lock.json")),
		await readFile(path.join(directory, "README.md"), "utf8"),
		actualExports,
	);
	const notice = await readFile(path.join(directory, "THIRD_PARTY_NOTICES.md"), "utf8");
	if (
		!notice.includes(`type-fest ${report.upstream.version}`) ||
		!notice.includes("Copyright (c) Sindre Sorhus") ||
		!notice.includes("Permission is hereby granted")
	)
		throw Error("Missing upstream MIT notice");
	const ds = diagnostics([path.join(directory, "src/index.d.ts")]);
	if (ds.length) throw Error(ds.map(diagnosticText).join("\n"));
	const result: unknown = JSON.parse(npm(["pack", "--ignore-scripts", "--json"], directory));
	if (!Array.isArray(result) || !result[0] || typeof result[0].filename !== "string")
		throw Error("Invalid npm pack result");
	const packed = result[0] as {
		filename: string;
		integrity: string;
		files: { path: string }[];
		size: number;
		unpackedSize: number;
	};
	integrity(packed.integrity);
	const required = [
		"package.json",
		"README.md",
		"LICENSE",
		"THIRD_PARTY_NOTICES.md",
		"compatibility.json",
		"src/index.d.ts",
	];
	if (required.some((name) => !packed.files.some((file) => file.path === name)))
		throw Error("Required package file missing");
	for (const file of packed.files) {
		if (
			!/^(package\.json|README\.md|LICENSE|THIRD_PARTY_NOTICES\.md|compatibility\.json|src\/.*\.d\.ts)$/.test(
				file.path,
			)
		)
			throw Error(`Unexpected package file: ${file.path}`);
	}
	const tarball = path.join(directory, packed.filename);
	if (
		"sha512-" +
			createHash("sha512")
				.update(await readFile(tarball))
				.digest("base64") !==
		packed.integrity
	)
		throw Error("Packed artifact integrity mismatch");
	await verifyConsumer(tarball, report, packed.integrity);
	console.log(
		`Verified ${names.length}/${report.exports.length} exports; tarball ${packed.size} bytes (${packed.unpackedSize} unpacked)`,
	);
	return { tarball, integrity: packed.integrity };
}

export async function verifyConsumer(
	artifact: string,
	report: Report,
	expectedIntegrity: string,
): Promise<void> {
	const names = report.exports.filter((entry) => entry.status !== "omitted").map((entry) => entry.name);
	await temporary(async (consumer) => {
		await writeFile(
			path.join(consumer, "package.json"),
			JSON.stringify({ name: "rbxts-consumer", version: "1.0.0", private: true }),
		);
		npm(
			[
				"install",
				"--ignore-scripts",
				"--no-audit",
				"--no-fund",
				"--registry=https://registry.npmjs.org/",
				artifact,
				...["@rbxts/compiler-types", "@rbxts/types"].map(
					(n) => `${n}@${matrix[n as keyof typeof matrix]}`,
				),
			],
			consumer,
		);
		const installedLock = await json<{ packages: Record<string, { integrity?: string }> }>(
			path.join(consumer, "package-lock.json"),
		);
		if (installedLock.packages["node_modules/@rbxts/type-fest"]?.integrity !== expectedIntegrity)
			throw Error("Installed consumer artifact integrity differs from verified tarball");
		const installedReport = await json<Report>(
			path.join(consumer, "node_modules/@rbxts/type-fest/compatibility.json"),
		);
		if (JSON.stringify(installedReport) !== JSON.stringify(report))
			throw Error("Installed compatibility report differs from verified artifact");
		await mkdir(path.join(consumer, "src"));
		const imported = `import type {${names.join(",")}} from "@rbxts/type-fest";\n`;
		await writeFile(
			path.join(consumer, "src/index.ts"),
			imported + semantics(new Set(names)) + "\nexport {};\n",
		);
		await writeFile(
			path.join(consumer, "tsconfig.json"),
			JSON.stringify({
				compilerOptions: {
					allowSyntheticDefaultImports: true,
					downlevelIteration: true,
					moduleDetection: "force",
					module: "commonjs",
					moduleResolution: "node",
					noLib: true,
					strict: true,
					exactOptionalPropertyTypes: true,
					skipLibCheck: false,
					target: "ESNext",
					typeRoots: ["node_modules/@rbxts"],
					rootDir: "src",
					outDir: "out",
				},
				include: ["src"],
			}),
		);
		command(
			process.execPath,
			[path.join(root, "node_modules/roblox-ts/out/CLI/cli.js"), "--type", "package"],
			consumer,
		);
		const emitted = await readdir(path.join(consumer, "out"), { recursive: true });
		const lua = emitted.filter((f) => /\.lua(u)?$/.test(f));
		if (!lua.length) throw Error("Consumer produced no Luau output");
		const output = (
			await Promise.all(lua.map((f) => readFile(path.join(consumer, "out", f), "utf8")))
		).join("\n");
		if (output.includes("type-fest") || output.includes("tagged-tag"))
			throw Error("Type-only import generated a runtime dependency");
	});
}
if (require.main === module) verify().catch(failure);
