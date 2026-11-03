# PLAN.md — Automated, verified `@rbxts/type-fest`

## 1. Goal, decisions, and principles

### 1.1 Deliverable

Automatically track the latest stable type-fest release, produce the largest safely supported Roblox API, verify the actual npm package and publish daily.

```text
Upstream → declaration graph → explicit adaptations → supported API + omissions
         → declaration checks → packed rbxtsc consumer → commit/push → npm publish
```

### 1.2 Confirmed decisions

| Concern           | Decision                                                       |
| ----------------- | -------------------------------------------------------------- |
| Package           | @rbxts/type-fest                                               |
| Versions          | Exact upstream stable versions; no adapter revisions           |
| Coverage          | Attempt every upstream public export                           |
| Incompatibility   | Publish the verified remainder; explain every omission         |
| Existing API loss | Publish with explicit removal notice, including patch releases |
| Credentials       | Placeholders; pause only for required account setup/access     |
| Automation        | Fully automatic after bootstrap                                |

Versions do not imply identical upstream API coverage or independent semver guarantees.

### 1.3 Rules

Gall's law: establish a small working system before extending compatibility. Minimalism: native Node facilities and compiler APIs, no unnecessary architecture. Compliance: real Roblox declarations, actual compiler, preserved upstream MIT notices. Type safety: validate registry data, test behavior, no fake globals or broad replacement types. Visibility: examples, complete export classifications, concrete reasons and dependency traces. Automation: recover interrupted publication without duplicate versions.

## 2. Verified findings

### 2.1 Declarations only

Ship src/index.d.ts and reachable declarations, without main or Lua/Luau entry point. Import type is erased by roblox-ts. Enforce this with a packed consumer compile and emitted-output inspection.

```ts
import type { Merge } from "@rbxts/type-fest";
type Settings = Merge<{ enabled: boolean; retries: number }, { retries: 3 }>;
// {enabled: boolean; retries: 3}
```

### 2.2 Tested baseline

Pin roblox-ts 3.0.0, TypeScript 5.5.3, compiler-types 3.0.0-types.0 and Roblox types 1.0.805. Original Roblox declarations 1.0.960 fail baseline checks. Upstream 5.10.0 requires TS 5.9; this does not establish Roblox compatibility. Never mix Node/DOM ambient libraries into declaration validation. Use strict, noLib, exactOptionalPropertyTypes and skipLibCheck=false.

### 2.3 Correct Gemini's assumptions

Use AST/symbol analysis instead of deleting matching lines. Resolve nested helpers and barrels. Stage before replacing generated sources. Compare upstream, local and registry state independently. Retry unpublished committed versions. Explicit git add allowlist. Isolated upstream installation with lifecycle scripts disabled. Preserve verification tools; inspect actual npm contents rather than assuming size limits. Roblox arrays use size(), not length: do not replace tuple lengths with number.

## 3. Implementation

### 3.1 Files and tooling

Use scripts/sync.ts, compatibility.ts and verify.ts, with a small release orchestrator. Native fetch, fs/promises, argument-array subprocesses and temporary directories. Node 24, npm 11.19.0, pinned tsx/semver/TypeScript. Separate Node and Roblox tsconfigs. Workflows: ci.yml and sync-and-publish.yml. Generated src declarations, compatibility.json, README coverage and third-party notices.

### 3.2 Package

Name @rbxts/type-fest; generated exact upstream version; types src/index.d.ts; no main. Whitelist declaration files, README, compatibility report, LICENSE and THIRD_PARTY_NOTICES. Public registry https://registry.npmjs.org/. Repository https://github.com/studiorafa/rbxts-type-fest. MIT with upstream notices. Remove greeting/runtime build/watch scaffold. prepublishOnly verifies. Retain only reachable verified type dependencies, preserving tagged-tag identity when needed.

### 3.3 Generation

1. Validate exact stable version and registry integrity metadata.
2. Install published upstream into temporary storage with scripts disabled.
3. Parse all declarations and enumerate public exports with TypeScript.
4. Build declaration-level dependencies including aliases, wildcard barrels and cycles.
5. Apply explicit tested adaptations; start with unresolved PropertyKey → local keyof any.
6. Omit incompatible declarations and dependent exports; preserve unrelated siblings.
7. Generate root exports, coverage, adaptation identifiers, concrete diagnostics/traces and API removals.
8. Validate complete staged package before replacing fixed generated files; update manifest and root lockfile version together.

No global augmentation, fake DOM/Node objects or any/unknown/never substitutions to silence errors. Reconsider omissions on every new upstream version. New semantic rewrites require investigation and fixed expected-result tests. /globals is explicitly unsupported because it modifies Roblox ambient declarations.

### 3.4 Coverage

Classify every public export exactly once: supported, adapted or omitted. Report upstream integrity, tool matrix, rule identifiers, reasons and traces. Generate a marked README table from the same report, with available/total counts and newly removed exports. Every omission receives a concrete single-line reason; never merely label it sanitized.

## 4. Automation

### 4.1 Commands

```sh
npm run sync
npm run sync -- --version 5.10.0
npm run sync -- --check
npm run verify
```

Check mode reproduces the recorded upstream artifact without modifying tracked files.

### 4.2 Workflows

Daily 17 0 * * * UTC and manual dispatch with bootstrap boolean false. Release concurrency group type-fest-release; cancel-in-progress=false. Ubuntu GitHub-hosted runners, Node 24, npm 11.19.0. Verified SHA-pinned checkout/setup-node v6; shallow main checkout. Release contents:write, OIDC id-token:write. Main branch/original repository only. Built-in GITHUB_TOKEN, no PAT. Normal publish requires PUBLISH_ENABLED=true. Bootstrap token confined to explicit bootstrap execution. Unprivileged PR/main CI. Document schedule delays and 60-day inactivity disablement without keepalive commits.

### 4.3 Recovery

Published matching target: verified no-op. Absent target: generate/verify/commit/push/publish, including when its generated commit already exists. Incompatible exports: report and continue. Broken baseline, empty API, generator failure or invalid remaining output: fail. Rejected push: no publication. Publish tested tarball only, public/latest, scripts disabled. Recheck target before publishing. On ambiguous failure query exact version and verify repository and integrity; mismatches stop. Never overwrite versions. Adapter fixes wait for next upstream release.

## 5. Tests and acceptance

### 5.1 Verification boundary

Generated imports exercise every shipped export. Full strict declaration checks cover signatures. Fixed expected type assertions cover meaningful utilities and every adaptation. Install actual .tgz in isolated consumer, run rbxtsc and inspect Luau for accidental package runtime dependencies. Expected-result tests must not merely mirror generator output. Failing semantic exports are omitted and final output rechecked.

### 5.2 Scenarios

Nested declarations, aliases/barrels/cycles, unrelated siblings, unsupported globals/dependencies and array length assumptions. Complete coverage with concrete omission traces. Optional/readonly properties, unions, generic behavior and accepted/rejected assignments. Package entry point/imports/licenses and no tooling/downloads/node_modules. Publication first run/no-op/retry/network ambiguity/races. Deterministic repeated generation.

### 5.3 Done

Latest upstream generates a nonempty verified package. Coverage/removals visible. Actual packed consumer passes without package Lua. Local verification and CI checks pass. Daily publishing succeeds after setup and safely no-ops. Failed publishing retries without new versions. No credentials committed or needed for generation.

## 6. Credentials and handoff

### 6.1 Placeholders

Npm account: <NPM_ACCOUNT_WITH_RBXTS_PUBLISH_ACCESS>. Bootstrap NPM_TOKEN: <SHORT_LIVED_GRANULAR_NPM_TOKEN>. GitHub PAT: not required. Trusted publisher: studiorafa / rbxts-type-fest / sync-and-publish.yml. PUBLISH_ENABLED=false until setup.

Token guide: https://docs.npmjs.com/creating-and-viewing-access-tokens/ — create a granular token with necessary @rbxts scope publishing access and permitted noninteractive authentication, then store as Actions secret NPM_TOKEN.

### 6.2 Bootstrap

Prepare and verify latest stable and its immediately preceding stable. Explicit bootstrap dispatch publishes preceding real version with token and bootstrap tag; reject if package already exists. Pause for user to configure npm trusted publisher with direct publish allowed, and PUBLISH_ENABLED=true. Immediately dispatch normal mode to publish latest with OIDC within its two-day validation window. Verify registry/install and remove bootstrap token. Organization publishing access is required.

### 6.3 Execution sequence

Save plan → clean baseline → one working generation → tested adaptations/report → packed consumer → workflows/recovery → both bootstrap artifacts → pause for account setup → first automatic publish. Keep Gall's law as the constraint on complexity.

## References

- https://raw.githubusercontent.com/roblox-ts/roblox-ts/v3.0.0/src/TSTransformer/nodes/statements/transformImportDeclaration.ts
- https://raw.githubusercontent.com/roblox-ts/roblox-ts/v3.0.0/package.json
- https://github.com/sindresorhus/type-fest#install
- https://raw.githubusercontent.com/roblox-ts/compiler-types/master/types/Array.d.ts
- https://raw.githubusercontent.com/sindresorhus/type-fest/v5.10.0/license-mit
- https://raw.githubusercontent.com/sindresorhus/tagged-tag/main/index.d.ts
- https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule
- https://docs.npmjs.com/cli/v11/commands/npm-publish/
- https://docs.npmjs.com/cli/v11/commands/npm-trust/
- https://docs.npmjs.com/trusted-publishers/
- https://roblox-ts.com/docs/guides/typescript-packages/
