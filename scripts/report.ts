import type { Report } from "./compatibility";

export function coverage(report: Report): string {
	const available = report.exports.filter((entry) => entry.status !== "omitted").length;
	const rows = report.exports.map((entry) => {
		const reason =
			entry.reason ?? (entry.adaptations.length ? entry.adaptations.join(", ") : "Available");
		return `| \`${entry.name}\` | ${entry.status} | ${reason.replaceAll("|", "\\|").replace(/[\r\n]+/g, " ")} |`;
	});
	return `# Compatibility\n\nType-Fest **${report.upstream.version}**: **${available}/${report.exports.length}** types available.\n\nRemoved since the previous generated version: ${report.removed.length ? report.removed.map((name) => "`" + name + "`").join(", ") : "none"}.\n\n| Export | Status | Reason |\n| --- | --- | --- |\n${rows.join("\n")}\n\n\`/globals\` is unavailable because it changes Roblox's global declarations.\n`;
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
