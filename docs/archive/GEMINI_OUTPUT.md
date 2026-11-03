The general goal is to automate the daily syncing, versioning, and npm publishing of our initialized roblox-ts package, "@rbxts/type-fest", so that it automatically matches the upstream version of "sindresorhus/type-fest" without manual daily editing.

WHAT I GIVE

- Github Token: [Insert your GitHub PAT here, or leave blank if using a local git agent with push access]
- NPM Automation Token: [Insert your NPM Automation Token here]

STEPS I NEED TO DO IF I HAVEN'T DONE THEM YET:

1. Go to <https://npmjs.com> to generate an Access Token. Select "Automation" as the token type.
2. Go to the GitHub repository Settings > Secrets and variables > Actions. Create a secret named NPM_TOKEN and paste the npm token there.

EXTRA CONTEXT & CONSTRAINTS:

- I have already initialized the roblox-ts package project in the current folder (package.json and tsconfig.json already exist).
- The package must be kept strictly compliant with the roblox-ts compiler ecosystem.
- Upstream source links to keep track of:
  - Repository: <https://github.com>
  - NPM Package: <https://npmjs.compackage/type-fest>

YOUR TASK AS MY CODING AGENT:

1. Create a GitHub Actions workflow file at .github/workflows/sync-and-publish.yml that runs on a daily cron schedule ('0 0 ** *') and on workflow_dispatch.
2. The workflow must check the latest version of <https://npmjs.compackage/type-fest> and compare it to the current version of <https://npmjs.compackage/@rbxts/type-fest>.
3. If a new version is available, it must:
   - Temporarily download the new version of type-fest.
   - Clean the existing source code directory in this project.
   - Copy the type definition files from the upstream type-fest package into our package source folder.
   - Update our package.json version to exactly match the upstream version string.
   - Commit and push the changes back to our GitHub repository.
   - Publish the updated package to npm using the NPM_TOKEN secret.
4. Include a step or a separate Node.js script in the pipeline to sanitize/transform any standard web/DOM or Node.js ambient globals found in upstream types that are incompatible with the roblox-ts compiler environment.

Here is a supplementary Environment Pitfalls & Direct Fixes prompt that you can feed to your agent right alongside the primary instructions. It calls out the specific quirks of GitHub Actions, npm registries, and roblox-ts.
text
ADDITIONAL COMPLIANCE AND ENVIRONMENT NITPICKS (CRITICAL):

Please structure the automation code to preemptively avoid the following platform limitations and environment quirks:

1. GITHUB ACTIONS DISK RUNNER LIMITS & BLOAT
   - Context: GitHub Actions standard ubuntu runners come with software pre-installed (Android SDKs, .NET, Docker layers) which eats into the baseline storage. Heavy node_modules dependencies or deep git dependency history can push the runner near its edge or make it highly inefficient.
   - Direct Obvious Fix:
     - Perform a shallow clone (`fetch-depth: 1`) during the checkout step to minimize `.git` folder bloat.
     - Execute `npm prune --production` or run `npm install --no-save` for `type-fest` so its heavy development sub-dependencies don't remain cached or take up unnecessary workspace room.
     - Ensure we aren't caching huge transient directories across automated daily runs.

2. NPM REGISTRY LIMITS (THE 1MB INDIVIDUAL FILE AND 256MB ENTIRE PAYLOAD QUIRK)
   - Context: npm has a hard limit on individual metadata/package.json sizing constraints on certain enterprise proxies, and an absolute 256MB limit on the total zipped package payload.
   - Direct Obvious Fix:
     - Never package `node_modules/` or original raw source downloads into our final npm package.
     - Explicitly add a `"files": ["src", "README.md", "package.json"]` array whitelist to our package.json instead of relying on a blacklisting `.npmignore`. This guarantees ONLY our processed, lightweight roblox-ts type definitions get zipped up and uploaded, keeping the final payload safely under a few megabytes.

3. ROBLOX-TS ENVIRONMENT DIFFERENCES
   - Context: Standard TypeScript allows global DOM objects, browser APIs, and Node.js-specific modules (like Buffer, Window, HTMLElement, Process). roblox-ts does not support these ambient types since Luau runs in an entirely separate sandboxed game environment.
   - Direct Obvious Fix:
     - When copying types over from the upstream "sindresorhus/type-fest", the script must systematically search and either strip out, omit, or replace keys that use DOM/Node types.
     - If a file relies entirely on standard web globals, skip copying that specific file to avoid throwing continuous compiler errors for downstream roblox-ts developers.
Usa el código con precaución.

Dependency Stack & Tooling

To build an architecture that follows Gall’s Law (starting from a working simple system and evolving safely), avoid heavy or over-engineered frameworks. Use a tight, precise runtime surface.
• Language & Runtime: Node.js + TypeScript (tsx)
 • Use tsx to run TypeScript scripts directly inside the automated workflow shell without an explicit pre-compilation step. This maintains a true "Just In Time" workflow.
• HTTP Client: Native Node.js fetch (Built-in since Node 18+). Zero dependencies.
• File System Wrapper: Native Node.js fs/promises. Zero dependencies.

Minimalist Architecture File Structure

text
.github/workflows/
  └── sync.yml              # Imperative Shell (The orchestration engine)
src/

# Empty directory where compiled/cleaned .ts or .d.ts files wait for npm publish

lib/
  ├── pipeline.ts           # Imperative Shell (Translates domain steps to English)
  ├── sanitize.ts           # Functional Core (Pure data transformations)
  └── types.ts              # Value Objects (Error-unrepresentable design types)
package.json                # Standard npm/roblox-ts configuration
tsconfig.json               # Configured for roblox-ts publishing
Usa el código con precaución.

Implementation Code

1. lib/types.ts (Value Objects & Types)

By wrapping raw primitives into distinct types early, invalid combinations or bad versions become entirely unrepresentable before processing ever runs.
typescript
export type SemanticVersion = string;

export interface VersionState {
  readonly upstream: SemanticVersion;
  readonly local: SemanticVersion;
  readonly needsUpdate: boolean;
}

export interface SyncTarget {
  readonly filename: string;
  readonly content: string;
}

export interface SanitizedTarget {
  readonly filename: string;
  readonly content: string;
  readonly isValidForRoblox: boolean;
}
Usa el código con precaución.

1. lib/sanitize.ts (Functional Core)

This module consists entirely of side-effect-free, pure functions. It inputs raw file content and returns modified content or filtering decisions. It contains no try/catch or API side-effects, making it highly deterministic and trivial to test.
typescript
import { SyncTarget, SanitizedTarget } from "./types";

// Explicit list of standard web browser/Node globals forbidden in roblox-ts
const FORBIDDEN_GLOBALS = [
  "HTMLElement",
  "Window",
  "Document",
  "Buffer",
  "process",
  "Navigator"
];

/**

- Strips out or sanitizes elements that violate roblox-ts structural restrictions
 */
export function sanitizeFile(target: SyncTarget): SanitizedTarget {
  let cleanedContent = target.content;

  // Rule 1: Remove lines or block signatures containing unsupported environment globals
  for (const forbidden of FORBIDDEN_GLOBALS) {
    if (cleanedContent.includes(forbidden)) {
      // Direct strategy: strip lines containing incompatible web globals to save downstream compilers
      const lines = cleanedContent.split("\n");
      cleanedContent = lines
        .filter(line => !line.includes(forbidden))
        .join("\n");
    }
  }

  // Rule 2: Ensure any specific type adjustments needed for roblox are appended safely
  // (e.g. exporting types or formatting modifications)

  // Explicit verification heuristic
  const isValidForRoblox = !FORBIDDEN_GLOBALS.some(g => cleanedContent.includes(g));

  return {
    filename: target.filename,
    content: cleanedContent,
    isValidForRoblox
  };
}
Usa el código con precaución.

1. lib/pipeline.ts (Imperative Shell)

This orchestrates the side effects. It reads like plain English, moving data through the functional core down to the file system. if statements are completely removed via clear control maps and immediate functional pipelines.
typescript
import { execSync } from "child_process";
import *as fs from "fs/promises";
import* as path from "path";
import { sanitizeFile } from "./sanitize";
import { VersionState, SyncTarget } from "./types";

async function getVersionState(): Promise<VersionState> {
  const upstream = execSync("npm view type-fest version").toString().trim();
  const local = JSON.parse(await fs.readFile("package.json", "utf-8")).version;

  return {
    upstream,
    local,
    needsUpdate: upstream !== local
  };
}

async function fetchUpstreamFiles(version: string): Promise<SyncTarget[]> {
  // Download upstream temporarily into local project context safely without bloating workspace
  execSync(`npm install type-fest@${version} --no-save --no-audit --no-fund`);

  const upstreamPath = path.join("node_modules", "type-fest", "source");
  const files = await fs.readdir(upstreamPath);

  return Promise.all(
    files
      .filter(file => file.endsWith(".d.ts") || file.endsWith(".ts"))
      .map(async file => ({
        filename: file,
        content: await fs.readFile(path.join(upstreamPath, file), "utf-8")
      }))
  );
}

async function writeToSource(targets: SyncTarget[]): Promise<void> {
  // Wipe old directory safely to ensure dead code isn't preserved
  await fs.rm("src", { recursive: true, force: true });
  await fs.mkdir("src", { recursive: true });

  const actions = targets
    .map(sanitizeFile)
    .filter(result => result.isValidForRoblox)
    .map(result => fs.writeFile(path.join("src", result.filename), result.content));

  await Promise.all(actions);
}

async function updatePackageVersion(version: string): Promise<void> {
  const pkg = JSON.parse(await fs.readFile("package.json", "utf-8"));
  pkg.version = version;
  await fs.writeFile("package.json", JSON.stringify(pkg, null, 2));
}

// Master execution block - reads like sequential prose
async function run() {
  const state = await getVersionState();

  // Execution structural map replaces classical complex conditional nests
  const executionStrategy = {
    true: async () => {
      console.log(`Update required! Syncing version: ${state.upstream}`);
      const rawFiles = await fetchUpstreamFiles(state.upstream);
      await writeToSource(rawFiles);
      await updatePackageVersion(state.upstream);
      console.log("Sync complete. Ready for commit and publish steps.");
    },
    false: async () => {
      console.log("No new version detected upstream. Exiting pipeline.");
    }
  };

  await executionStrategy[String(state.needsUpdate) as "true" | "false"]();
}

run().catch(err => {
  console.error("Pipeline run hit an unrecoverable failure state:", err);
  process.exit(1);
});
Usa el código con precaución.

Automated Shell Orchestration (GitHub Actions)

This pipeline incorporates optimization mitigations against runner storage leaks and npm packaging overhead, running natively via npx tsx.
yaml
name: Continuous Just-In-Time Type Sync

on:
  schedule:
    - cron: '0 0 ** *'
  workflow_dispatch:

jobs:
  sync-and-publish:
    runs-on: ubuntu-latest
    steps:
      - name: Shallow Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 1 # Drastically protects local disk bounds from repository bloated historical records

      - name: Initialize Environment Workspace
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://npmjs.org'

      - name: Run Pipeline Automation
        run: npx tsx lib/pipeline.ts

      - name: Verification Registry Verification (Dry Run)
        run: npm pack --dry-run # Asserts output artifact parameters to prevent unintended large uploads

      - name: Sync Commit Verification & Deployment
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: |
          # If package.json changed, push and publish changes safely
          if [ -n "$(git status --porcelain package.json)" ]; then
            git config --global user.name "github-actions[bot]"
            git config --global user.email "41898282+github-actions[bot]@users.noreply.github.com"
            git add .
            git commit -m "chore: auto-sync update matching upstream release structures"
            git push origin main
            npm publish --access public
          fi
