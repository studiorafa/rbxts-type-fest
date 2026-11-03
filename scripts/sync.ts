import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";
import {
	exactVersion,
	failure,
	generatedFiles,
	json,
	metadata,
	npm,
	replaceGenerated,
	root,
	stablePair,
	temporary,
	upstreamRelease,
} from "./common";
import { generate, matrix, Report } from "./compatibility";
import { verify } from "./verify";
import { coverage, removedExports } from "./report";
export async function sync(version?: string, check = false, artifacts?: string): Promise<void> {
	const pkg = await json<Record<string, unknown>>(path.join(root, "package.json"));
	const previous = await json<Report>(path.join(root, "compatibility.json")).catch(() => undefined);
	const latest = await metadata("type-fest", version ?? (check ? previous?.upstream.version : "latest"));
	if (!latest) throw Error("Upstream release not found");
	const artifact = upstreamRelease(latest),
		target = artifact.version;
	if (version && target !== exactVersion(version))
		throw Error("Registry returned a different upstream version");
	if (check && previous?.upstream.integrity !== artifact.integrity)
		throw Error("Recorded upstream integrity differs from registry");
	await temporary(async (temp) => {
		npm([
			"install",
			"--prefix",
			temp,
			"--ignore-scripts",
			"--no-audit",
			"--no-fund",
			"--save-exact",
			"--registry=https://registry.npmjs.org/",
			`type-fest@${target}`,
		]);
		const installed = await json<{ packages: Record<string, { integrity?: string }> }>(
			path.join(temp, "package-lock.json"),
		);
		if (installed.packages["node_modules/type-fest"]?.integrity !== artifact.integrity)
			throw Error("Upstream artifact integrity changed during download");
		const upstream = path.join(temp, "node_modules/type-fest");
		const stage = path.join(temp, "stage");
		await mkdir(path.join(stage, "src"), { recursive: true });
		// A junction also works without Windows symlink privileges; not included by npm pack.
		const { symlink } = await import("node:fs/promises");
		await symlink(path.join(root, "node_modules"), path.join(stage, "node_modules"), "junction");
		const decisions = await generate(upstream, path.join(stage, "src"));
		const report: Report = {
			upstream: artifact,
			toolchain: matrix,
			exports: decisions,
			removed: removedExports(
				previous?.upstream.version === target ? previous : previous && { ...previous, removed: [] },
				decisions,
			),
			unsupportedEntrypoints: {
				"/globals": "Global augmentations alter the Roblox ambient environment",
			},
		};
		const dependencies: Record<string, string> = {};
		const generated = ts.createProgram([path.join(stage, "src/index.d.ts")], {
			noLib: true,
			moduleResolution: ts.ModuleResolutionKind.Node10,
		});
		for (const file of generated
			.getSourceFiles()
			.filter((file) =>
				path.resolve(file.fileName).startsWith(path.resolve(stage, "src") + path.sep),
			)) {
			const visit = (node: ts.Node): void => {
				const literal =
					ts.isImportDeclaration(node) || ts.isExportDeclaration(node)
						? node.moduleSpecifier
						: ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)
							? node.argument.literal
							: undefined;
				if (literal && ts.isStringLiteral(literal) && !literal.text.startsWith(".")) {
					const name = literal.text.startsWith("@")
						? literal.text.split("/").slice(0, 2).join("/")
						: literal.text.split("/")[0];
					dependencies[name] = exactVersion(
						(pkg.dependencies as Record<string, unknown> | undefined)?.[name],
					);
				}
				ts.forEachChild(node, visit);
			};
			visit(file);
		}
		for (const [name, version] of Object.entries(dependencies)) {
			const local = await json<{ version: string }>(
				path.join(root, "node_modules", name, "package.json"),
			);
			const downloaded = await json<{ version: string }>(
				path.join(temp, "node_modules", name, "package.json"),
			);
			if (local.version !== version || downloaded.version !== version)
				throw Error(`Unverified dependency version: ${name}`);
		}
		const manifest = { ...pkg, version: target, dependencies };
		await writeFile(path.join(stage, "package.json"), JSON.stringify(manifest, null, 2) + "\n");
		const lock = await json<Record<string, unknown>>(path.join(root, "package-lock.json"));
		lock.version = target;
		(lock.packages as Record<string, Record<string, unknown>>)[""].version = target;
		await writeFile(path.join(stage, "package-lock.json"), JSON.stringify(lock, null, 2) + "\n");
		if (JSON.stringify(pkg.dependencies ?? {}) !== JSON.stringify(dependencies))
			npm(
				[
					"install",
					"--package-lock-only",
					"--ignore-scripts",
					"--no-audit",
					"--no-fund",
					"--registry=https://registry.npmjs.org/",
				],
				stage,
			);
		await writeFile(path.join(stage, "compatibility.json"), JSON.stringify(report, null, 2) + "\n");
		const readme = (await readFile(path.join(root, "README.md"), "utf8")).replaceAll("\r\n", "\n");
		await writeFile(path.join(stage, "README.md"), readme);
		await mkdir(path.join(stage, "docs"));
		await writeFile(path.join(stage, "docs/compatibility.md"), coverage(report));
		const projectLicense = (await readFile(path.join(root, "LICENSE"), "utf8"))
			.replaceAll("\r\n", "\n")
			.split("\n\n---\n\nType-Fest\n")[0]
			.trimEnd();
		await writeFile(
			path.join(stage, "LICENSE"),
			`${projectLicense}\n\n---\n\nType-Fest\nhttps://github.com/sindresorhus/type-fest/tree/v${target}\n\n` +
				(await readFile(path.join(upstream, "license-mit"), "utf8")),
		);
		const packed = await verify(stage);
		if (artifacts) {
			await mkdir(artifacts, { recursive: true });
			await cp(packed.tarball, path.join(artifacts, path.basename(packed.tarball)));
			await cp(
				path.join(stage, "compatibility.json"),
				path.join(artifacts, `compatibility-${target}.json`),
			);
			await writeFile(
				path.join(artifacts, `artifact-${target}.json`),
				JSON.stringify(
					{
						version: target,
						filename: path.basename(packed.tarball),
						integrity: packed.integrity,
						upstream: artifact,
					},
					null,
					2,
				) + "\n",
			);
			console.log(`Prepared ${target} in ${artifacts}`);
			return;
		}
		const { readdir } = await import("node:fs/promises");
		async function listing(dir: string): Promise<string[]> {
			const es = await readdir(dir, { withFileTypes: true });
			return (
				await Promise.all(
					es.map(async (e) =>
						e.isDirectory()
							? (await listing(path.join(dir, e.name))).map((n) => e.name + "/" + n)
							: [e.name],
					),
				)
			)
				.flat()
				.sort();
		}
		const files = generatedFiles.filter((file) => file !== "src");
		if (check) {
			const sourceFiles = await listing(path.join(stage, "src"));
			const currentFiles = await listing(path.join(root, "src"));
			if (JSON.stringify(sourceFiles) !== JSON.stringify(currentFiles))
				throw Error("Generated declaration list differs");
			for (const f of [...files, ...sourceFiles.map((f) => "src/" + f)])
				if (
					(f.endsWith(".json")
						? JSON.stringify(await json(path.join(stage, f)))
						: await readFile(path.join(stage, f), "utf8")) !==
					(f.endsWith(".json")
						? JSON.stringify(await json(path.join(root, f)))
						: await readFile(path.join(root, f), "utf8"))
				)
					throw Error(`Generated file differs: ${f}`);
			console.log("Generated output is reproducible");
			return;
		}
		await replaceGenerated(stage);
		console.log(`Generated type-fest ${target}`);
	});
}
export async function prepareBootstrap(): Promise<void> {
	const upstream = await metadata("type-fest");
	if (!upstream) throw Error("Missing upstream package");
	const { latest, previous } = stablePair(upstream);
	for (const version of [previous, latest]) await sync(version, false, path.join(root, "artifacts"));
}
if (require.main === module) {
	if (process.argv.includes("--prepare-bootstrap")) {
		prepareBootstrap().catch(failure);
	} else {
		const args = process.argv.slice(2);
		const index = args.indexOf("--version");
		if (args.some((a, i) => a !== "--check" && a !== "--version" && !(index >= 0 && i === index + 1)))
			throw Error("Unknown sync argument");
		sync(index >= 0 ? exactVersion(args[index + 1]) : undefined, args.includes("--check")).catch(failure);
	}
}
