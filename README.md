# @rbxts/type-fest

[Type-Fest](https://github.com/sindresorhus/type-fest) types for roblox-ts.

## Install

```sh
npm install @rbxts/type-fest
```

## Usage

```ts
import type {Merge} from "@rbxts/type-fest";

type Settings = Merge<{enabled: boolean; retries: number}, {retries: 3}>;
// {enabled: boolean; retries: 3}
```

This package contains type declarations only. Use `import type`.

## Compatibility

Versions match Type-Fest. Some types are unavailable, and updates can remove types.
See the [compatibility report](https://github.com/studiorafa/rbxts-type-fest/blob/main/docs/compatibility.md).
