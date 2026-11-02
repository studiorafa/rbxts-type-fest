import type { Report } from "./compatibility";

export function coverage(report: Report): string {
	const available = report.exports.filter((entry) => entry.status !== "omitted").length;
	const rows = report.exports.map((entry) => {
		const reason =
			entry.reason ??
			(entry.adaptations.length
				? entry.adaptations.join(", ")
				: "Declaration and applicable semantic checks passed");
		return `| \`${entry.name}\` | ${entry.status} | ${reason.replaceAll("|", "\\|").replace(/[\r\n]+/g, " ")} |`;
	});
	return `<!-- coverage:start -->\n## Generated compatibility\n\nUpstream **${report.upstream.version}**: **${available}/${report.exports.length}** exports available.\n\nRemoved since the preceding generated API: ${report.removed.length ? report.removed.map((name) => "`" + name + "`").join(", ") : "none"}.\n\n| Export | Status | Reason |\n| --- | --- | --- |\n${rows.join("\n")}\n\n\`/globals\` is omitted: upstream global augmentations alter the Roblox ambient environment.\n<!-- coverage:end -->`;
}

export function removedExports(previous: Report | undefined, decisions: Report["exports"]): string[] {
	const available = new Set(
		decisions.filter((entry) => entry.status !== "omitted").map((entry) => entry.name),
	);
	// Retain notices during same-version regeneration, including newly discovered semantic failures.
	return [
		...new Set([
			...(previous?.removed ?? []),
			...(previous?.exports ?? [])
				.filter((entry) => entry.status !== "omitted" && !available.has(entry.name))
				.map((entry) => entry.name),
		]),
	]
		.filter((name) => !available.has(name))
		.sort();
}
