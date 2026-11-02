import ts from "typescript";
import path from "node:path";
import { readFileSync } from "node:fs";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { exactVersion, root } from "./common";
import { semantics } from "./expectations";
export const matrix = {
	"roblox-ts": "3.0.0",
	typescript: "5.5.3",
	"@rbxts/compiler-types": "3.0.0-types.0",
	"@rbxts/types": "1.0.805",
};
export interface Decision {
	name: string;
	status: "supported" | "adapted" | "omitted";
	source: string;
	exportedName?: string;
	adaptations: string[];
	reason?: string;
	dependencyTrace?: string[];
}
export interface Report {
	upstream: { version: string; integrity: string };
	toolchain: typeof matrix;
	exports: Decision[];
	removed: string[];
	unsupportedEntrypoints: Record<string, string>;
}
export const options: ts.CompilerOptions = {
	noLib: true,
	strict: true,
	exactOptionalPropertyTypes: true,
	skipLibCheck: false,
	noEmit: true,
	target: ts.ScriptTarget.ESNext,
	module: ts.ModuleKind.CommonJS,
	moduleResolution: ts.ModuleResolutionKind.Node10,
	typeRoots: [path.join(root, "node_modules/@rbxts")],
};
export const core = path.join(root, "node_modules/@rbxts/compiler-types/types/core.d.ts");
export function diagnostics(files: string[]): readonly ts.Diagnostic[] {
	return ts.getPreEmitDiagnostics(ts.createProgram([core, ...files], options));
}
export function diagnosticText(d: ts.Diagnostic): string {
	return `TS${d.code}: ${ts.flattenDiagnosticMessageText(d.messageText, " ")}`;
}
function top(node: ts.Node): ts.Statement | undefined {
	let n = node;
	while (n.parent && !ts.isSourceFile(n.parent)) n = n.parent;
	return ts.isStatement(n) ? n : undefined;
}
function walk(node: ts.Node, fn: (node: ts.Node) => void): void {
	fn(node);
	ts.forEachChild(node, (n) => walk(n, fn));
}
export async function generate(
	upstream: string,
	destination: string,
	semanticOmissions = new Map<string, string>(),
	adapted = new Set<string>(),
): Promise<Decision[]> {
	const baseline = diagnostics([]);
	if (baseline.length) throw Error(`Broken Roblox baseline: ${baseline.map(diagnosticText).join("\n")}`);
	const belongs = (file: string) =>
		path
			.resolve(file)
			.replaceAll("\\", "/")
			.startsWith(path.resolve(upstream).replaceAll("\\", "/") + "/");
	const tracked = (file: string) =>
		belongs(file) ||
		path
			.resolve(file)
			.replaceAll("\\", "/")
			.startsWith(path.dirname(path.resolve(upstream)).replaceAll("\\", "/") + "/");
	const allowedDependencies =
		(
			JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")) as {
				dependencies?: Record<string, string>;
			}
		).dependencies ?? {};
	const entry = path.join(upstream, "index.d.ts");
	const outputPath = (file: string) =>
		path.resolve(file) === path.resolve(entry)
			? "upstream-index.d.ts"
			: path.relative(upstream, file).replaceAll("\\", "/");
	const relativeImport = (from: string, to: string) => {
		const relative = path.posix.relative(path.posix.dirname(outputPath(from)), outputPath(to));
		return relative.startsWith(".") ? relative : "./" + relative;
	};
	let program = ts.createProgram([core, entry], options);
	let checker = program.getTypeChecker();
	// Local alias only where PropertyKey is actually unresolved, never a global augmentation.
	for (const sf of program.getSourceFiles().filter((f) => belongs(f.fileName))) {
		const missing = program
			.getSemanticDiagnostics(sf)
			.some(
				(d) =>
					d.code === 2304 &&
					d.start !== undefined &&
					sf.text.slice(d.start, d.start + (d.length ?? 0)) === "PropertyKey",
			);
		if (missing) {
			await writeFile(sf.fileName, `type PropertyKey = keyof any;\n${sf.text}`);
			adapted.add(sf.fileName);
		}
	}
	program = ts.createProgram([core, entry], options);
	checker = program.getTypeChecker();
	const resolve = (s: ts.Symbol) => (s.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(s) : s);
	const internal = (n: ts.Node) => belongs(n.getSourceFile().fileName);
	const edges = new Map<ts.Statement, Set<ts.Statement>>();
	const errors = new Map<ts.Statement, string[]>();
	const imports = new Map<ts.Statement, Map<ts.Symbol, ts.ImportSpecifier | ts.ImportClause>>();
	const inlineImports = new Map<ts.ImportTypeNode, { specifier: string; name: string }>();
	const checkDependency = (specifier: string, statement: ts.Statement) => {
		if (specifier.startsWith(".")) return;
		const name = specifier.startsWith("@")
			? specifier.split("/").slice(0, 2).join("/")
			: specifier.split("/")[0];
		try {
			const pinned = exactVersion(allowedDependencies[name]);
			const resolved = ts.resolveModuleName(
				specifier,
				statement.getSourceFile().fileName,
				options,
				ts.sys,
			).resolvedModule;
			if (resolved?.packageId?.version !== pinned)
				errors.set(statement, [
					`External type dependency ${name} does not resolve to verified ${pinned}`,
				]);
		} catch {
			errors.set(statement, [
				`External type dependency ${name} is not pinned and verified in this package`,
			]);
		}
	};
	for (const sf of program.getSourceFiles().filter((f) => tracked(f.fileName))) {
		for (const stmt of sf.statements) {
			if (ts.isImportDeclaration(stmt) || ts.isExportDeclaration(stmt)) continue;
			const deps = new Set<ts.Statement>(),
				bindings = new Map<ts.Symbol, ts.ImportSpecifier | ts.ImportClause>();
			if (ts.isModuleDeclaration(stmt) && stmt.flags & ts.NodeFlags.GlobalAugmentation)
				errors.set(stmt, ["Global augmentation alters the Roblox ambient environment"]);
			walk(stmt, (n) => {
				if (ts.isImportTypeNode(n)) {
					if (
						!ts.isLiteralTypeNode(n.argument) ||
						!ts.isStringLiteral(n.argument.literal) ||
						!n.qualifier ||
						!ts.isIdentifier(n.qualifier)
					) {
						errors.set(stmt, [
							"Unqualified or namespace inline import requires an explicit compatibility rule",
						]);
						return;
					}
					const specifier = n.argument.literal.text;
					checkDependency(specifier, stmt);
					const imported = checker.getSymbolAtLocation(n.qualifier);
					const symbol = imported && resolve(imported);
					const declarations = symbol?.declarations ?? [];
					if (!declarations.length)
						errors.set(stmt, [`Unresolved inline import ${specifier}#${n.qualifier.text}`]);
					for (const declaration of declarations) {
						const dependency = top(declaration);
						if (dependency && tracked(declaration.getSourceFile().fileName)) deps.add(dependency);
					}
					const declaration = declarations[0];
					if (declaration && internal(declaration))
						inlineImports.set(n, {
							specifier: relativeImport(sf.fileName, declaration.getSourceFile().fileName),
							name: symbol!.name,
						});
				}
				if (!ts.isIdentifier(n)) return;
				const local = checker.getSymbolAtLocation(n);
				if (!local) return;
				for (const d of local.declarations ?? []) {
					if (ts.isImportSpecifier(d) || ts.isImportClause(d)) {
						bindings.set(local, d);
						const imported = top(d);
						if (imported) {
							deps.add(imported);
							if (
								ts.isImportDeclaration(imported) &&
								ts.isStringLiteral(imported.moduleSpecifier)
							) {
								const specifier = imported.moduleSpecifier.text;
								checkDependency(specifier, imported);
							}
						}
					}
					if (ts.isNamespaceImport(d))
						errors.set(stmt, ["Namespace import requires an explicit compatibility rule"]);
				}
				for (const d of resolve(local).declarations ?? []) {
					if (tracked(d.getSourceFile().fileName)) {
						const t = top(d);
						if (t && t !== stmt && !ts.isImportDeclaration(t) && !ts.isExportDeclaration(t))
							deps.add(t);
					}
				}
			});
			edges.set(stmt, deps);
			imports.set(stmt, bindings);
		}
	}
	for (const d of ts.getPreEmitDiagnostics(program)) {
		if (!d.file || d.start === undefined) throw Error(diagnosticText(d));
		if (!tracked(d.file.fileName))
			throw Error(`Dependency baseline: ${d.file.fileName}: ${diagnosticText(d)}`);
		let found = false;
		for (const stmt of d.file.statements)
			if (d.start >= stmt.getFullStart() && d.start < stmt.end) {
				errors.set(stmt, [...(errors.get(stmt) ?? []), diagnosticText(d)]);
				found = true;
			}
		if (!found) throw Error(diagnosticText(d));
	}
	const sf = program.getSourceFile(entry)!;
	const module = checker.getSymbolAtLocation(sf)!;
	for (const exported of checker.getExportsOfModule(
		checker.getSymbolAtLocation(program.getSourceFile(entry)!)!,
	)) {
		const reason = semanticOmissions.get(exported.name);
		if (reason)
			for (const d of resolve(exported).declarations ?? []) {
				const s = top(d);
				if (s) errors.set(s, [reason]);
			}
	}
	const selected = new Set<ts.Statement>();
	const decisions: Decision[] = [];
	for (const exported of checker
		.getExportsOfModule(module)
		.sort((a, b) => a.name.localeCompare(b.name, "en"))) {
		const symbol = resolve(exported);
		const starts = (symbol.declarations ?? []).map(top).filter((x): x is ts.Statement => !!x);
		const reachable = new Set<ts.Statement>();
		let blocker: { reason: string; trace: string[] } | undefined = starts.length
			? undefined
			: {
					reason: "Public export has no resolvable declaration",
					trace: [exported.name, "index.d.ts"],
				};
		if (starts.some((statement) => !internal(statement)))
			blocker = {
				reason: "Public export is declared outside upstream; requires an explicit compatibility rule",
				trace: [
					exported.name,
					path.relative(upstream, starts[0].getSourceFile().fileName).replaceAll("\\", "/"),
				],
			};
		const visit = (s: ts.Statement, trace: string[]) => {
			if (reachable.has(s)) return;
			reachable.add(s);
			const named = s as ts.Statement & { name?: ts.DeclarationName };
			const label =
				path.relative(upstream, s.getSourceFile().fileName).replaceAll("\\", "/") +
				"#" +
				(named.name?.getText(s.getSourceFile()) ?? ts.SyntaxKind[s.kind]);
			const next = [...trace, label];
			if (errors.has(s) && !blocker) blocker = { reason: errors.get(s)![0], trace: next };
			for (const d of edges.get(s) ?? []) visit(d, next);
		};
		starts.forEach((s) => visit(s, [exported.name]));
		const source = path
			.relative(upstream, starts[0]?.getSourceFile().fileName ?? entry)
			.replaceAll("\\", "/");
		const rules = [...reachable].some(
			(s) =>
				ts.isTypeAliasDeclaration(s) &&
				s.name.text === "PropertyKey" &&
				adapted.has(s.getSourceFile().fileName),
		)
			? ["property-key"]
			: [];
		if (blocker) {
			const b = blocker as { reason: string; trace: string[] };
			decisions.push({
				name: exported.name,
				exportedName: symbol.name,
				status: "omitted",
				source,
				adaptations: [],
				reason: b.reason,
				dependencyTrace: b.trace,
			});
		} else {
			for (const s of reachable)
				if (internal(s) && !ts.isImportDeclaration(s) && !ts.isExportDeclaration(s)) selected.add(s);
			decisions.push({
				name: exported.name,
				exportedName: symbol.name,
				status: rules.length ? "adapted" : "supported",
				source,
				adaptations: rules,
			});
		}
	}
	if (!decisions.some((d) => d.status !== "omitted")) throw Error("No compatible public exports");
	const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
	const grouped = new Map<ts.SourceFile, ts.Statement[]>();
	for (const s of selected) {
		const f = s.getSourceFile();
		grouped.set(f, [...(grouped.get(f) ?? []), s]);
	}
	for (const [file, statements] of grouped) {
		const bindings = new Map<ts.Symbol, ts.ImportSpecifier | ts.ImportClause>();
		for (const s of statements) for (const [k, v] of imports.get(s) ?? []) bindings.set(k, v);
		const lines: string[] = [];
		for (const [local, binding] of bindings) {
			const target = resolve(local);
			const decl = target.declarations?.[0];
			if (!decl) throw Error(`Unresolved import ${local.name}`);
			let specifier: string;
			let imported = target.name;
			if (internal(decl)) {
				specifier = relativeImport(file.fileName, decl.getSourceFile().fileName);
			} else {
				let n: ts.Node = binding;
				while (!ts.isImportDeclaration(n)) n = n.parent;
				specifier = (n.moduleSpecifier as ts.StringLiteral).text;
				imported = ts.isImportClause(binding)
					? "default"
					: (binding.propertyName?.text ?? binding.name.text);
			}
			lines.push(
				imported === "default"
					? `import type ${local.name} from ${JSON.stringify(specifier)};`
					: `import type {${imported}${imported === local.name ? "" : ` as ${local.name}`}} from ${JSON.stringify(specifier)};`,
			);
		}
		for (const s of statements.sort((a, b) => a.pos - b.pos)) {
			const transformed = ts.transform(s, [
				(context) => {
					const visit: ts.Visitor = (node) => {
						if (ts.isImportTypeNode(node) && inlineImports.has(node)) {
							const binding = inlineImports.get(node)!;
							return context.factory.updateImportTypeNode(
								node,
								context.factory.createLiteralTypeNode(
									context.factory.createStringLiteral(binding.specifier),
								),
								node.attributes,
								context.factory.createIdentifier(binding.name),
								node.typeArguments?.map(
									(argument) => ts.visitNode(argument, visit) as ts.TypeNode,
								),
								node.isTypeOf,
							);
						}
						return ts.visitEachChild(node, visit, context);
					};
					return (node) => ts.visitNode(node, visit) as ts.Statement;
				},
			]);
			try {
				lines.push(printer.printNode(ts.EmitHint.Unspecified, transformed.transformed[0], file));
			} finally {
				transformed.dispose();
			}
		}
		const output = path.join(destination, outputPath(file.fileName));
		await mkdir(path.dirname(output), { recursive: true });
		await writeFile(output, lines.join("\n") + "\n");
	}
	const exports = decisions
		.filter((d) => d.status !== "omitted")
		.map(
			(d) =>
				`export type {${d.exportedName ?? d.name}${d.exportedName && d.exportedName !== d.name ? ` as ${d.name}` : ""}} from ${JSON.stringify("./" + (d.source === "index.d.ts" ? "upstream-index.d.ts" : d.source))};`,
		);
	await writeFile(path.join(destination, "index.d.ts"), exports.join("\n") + "\n");
	const available = decisions.filter((d) => d.status !== "omitted").map((d) => d.name);
	const probe = path.join(path.dirname(destination), "semantic-probe.ts");
	const specifier = "./" + path.basename(destination) + "/index.d.ts";
	await writeFile(
		probe,
		`import type {${available.join(",")}} from ${JSON.stringify(specifier)};\n` +
			semantics(new Set(available)),
	);
	const semanticProgram = ts.createProgram([core, probe], options);
	let retry = false;
	const previouslyOmitted = new Set(semanticOmissions.keys());
	for (const d of ts.getPreEmitDiagnostics(semanticProgram)) {
		if (!d.file || path.resolve(d.file.fileName) !== path.resolve(probe) || d.start === undefined)
			throw Error(diagnosticText(d));
		const statement = d.file.statements.find((s) => d.start! >= s.getFullStart() && d.start! < s.end);
		if (!statement || !ts.isTypeAliasDeclaration(statement) || !statement.name.text.startsWith("Test"))
			throw Error(diagnosticText(d));
		const name = statement.name.text.slice(4).split("__")[0];
		if (previouslyOmitted.has(name)) throw Error("Semantic exclusion did not converge");
		if (!semanticOmissions.has(name))
			semanticOmissions.set(name, "Expected-result test failed: " + diagnosticText(d));
		retry = true;
	}
	await rm(probe);
	if (retry) {
		await rm(destination, { recursive: true, force: true });
		await mkdir(destination);
		return generate(upstream, destination, semanticOmissions, adapted);
	}
	return decisions;
}
