# @rbxts/type-fest

Type-Fest utilities adapted and verified for roblox-ts. **Versions follow upstream exactly; API coverage can differ, and an upstream patch can remove an incompatible export.** Review the generated table before upgrading.

```ts
import type {Merge} from "@rbxts/type-fest";
type Settings = Merge<{enabled: boolean; retries: number}, {retries: 3}>;
// {enabled: boolean; retries: 3}
```

```sh
npm install @rbxts/type-fest
npm ci
npm run sync
npm run sync -- --version 5.10.0
npm run sync -- --check
npm run verify
npm run prepare:bootstrap  # writes both verified tarballs to artifacts/
```

This package contains declarations only. Use `import type`; no package `.lua` or `.luau` entry point is required. Repository verification requires Node 24 and npm 11.19.0 (`.node-version` and `packageManager` record these versions). The tested Roblox matrix is roblox-ts 3.0.0, TypeScript 5.5.3, compiler-types 3.0.0-types.0 and Roblox types 1.0.805. Newer Roblox declarations are not automatically certified.

## Principles

Gall's law: extend a small working system from demonstrated needs. Use explicit, tested transformations, preserve type meaning, explain omissions, and verify the actual packed output. Never fake unsupported globals or hide errors with skipLibCheck.

## Publishing setup

| Setting | Value |
| --- | --- |
| npm account | `<NPM_ACCOUNT_WITH_RBXTS_PUBLISH_ACCESS>` |
| Bootstrap secret NPM_TOKEN | `<SHORT_LIVED_GRANULAR_NPM_TOKEN>` |
| GitHub PAT | Not required: built-in GITHUB_TOKEN |
| Trusted publisher | studiorafa / rbxts-type-fest / sync-and-publish.yml |
| PUBLISH_ENABLED | false until setup completes |

Token guide: [Create a granular npm token](https://docs.npmjs.com/creating-and-viewing-access-tokens/) with necessary @rbxts scope publishing access and permitted noninteractive authentication; store it as Actions secret NPM_TOKEN.

1. Obtain @rbxts organization publishing access. Commit and push this implementation to main.
2. Prepare and verify current/preceding upstream versions; explicitly dispatch bootstrap mode to publish the preceding release under the bootstrap tag.
3. In npm package settings configure [trusted publishing](https://docs.npmjs.com/trusted-publishers/) for the mapping above, explicitly allowing direct npm publish. Set Actions variable PUBLISH_ENABLED=true.
4. Immediately dispatch normal synchronization: it publishes latest through OIDC, validating the configuration within npm's two-day expiry window.
5. Verify installation and remove the temporary NPM_TOKEN secret.

Normal releases never fall back to NPM_TOKEN. Releases commit and push before publishing the tested tarball. Failed publishes retry even when the commit already exists; npm versions cannot be overwritten. Adapter fixes wait for the next upstream release. Incompatible exports are explicitly omitted while valid output continues publishing.

After bootstrap, an authenticated package maintainer can configure the trusted publisher with:

```sh
npm trust github @rbxts/type-fest --repo studiorafa/rbxts-type-fest --file sync-and-publish.yml --allow-publish
```

This may require browser authentication or 2FA. Keep `PUBLISH_ENABLED=false` until the configuration is ready. Bootstrap artifacts include a tarball, compatibility report, and `artifact-<version>.json` recording its SHA-512 integrity. Artifact preparation does not replace the repository's generated API.

Every release confirms the published package's identity, repository, integrity, and expected dist-tag, then installs that exact registry version in a fresh Roblox consumer and compiles it. Registry visibility checks retry four times with bounded delays; an unconfirmed result fails and can be retried without allocating a new version. An already published artifact that differs from the local verified package stops the release rather than overwriting it.

Generation validates in temporary storage before replacing the fixed generated paths. A failed replacement restores declarations, metadata, coverage, and notices together. If restoration itself fails, the error identifies a retained `.sync-backup-*` directory for recovery. `sync --check` reproduces the recorded upstream artifact without replacing repository files.

Daily checks run at 00:17 UTC. GitHub may delay scheduled jobs and disables public-repository schedules after 60 inactive days. Re-enable the workflow and use manual dispatch; no artificial keepalive commits are created. Branch protection must permit the bot's release commit; rejected pushes prevent publishing.

<!-- coverage:start -->
## Generated compatibility

Upstream **5.10.0**: **191/250** exports available.

Removed since the preceding generated API: none.

| Export | Status | Reason |
| --- | --- | --- |
| `Absolute` | supported | Declaration and applicable semantic checks passed |
| `AbstractClass` | supported | Declaration and applicable semantic checks passed |
| `AbstractConstructor` | supported | Declaration and applicable semantic checks passed |
| `AllExtend` | supported | Declaration and applicable semantic checks passed |
| `AllExtendOptions` | supported | Declaration and applicable semantic checks passed |
| `AllUnionFields` | omitted | TS2304: Cannot find name 'Date'. |
| `Alphanumeric` | supported | Declaration and applicable semantic checks passed |
| `And` | supported | Declaration and applicable semantic checks passed |
| `AndAll` | supported | Declaration and applicable semantic checks passed |
| `Arrayable` | supported | Declaration and applicable semantic checks passed |
| `ArrayElement` | supported | Declaration and applicable semantic checks passed |
| `ArrayIndices` | omitted | TS2536: Type '"length"' cannot be used to index type 'Partial<Element>'. |
| `ArrayLength` | omitted | TS2536: Type '"length"' cannot be used to index type 'T'. |
| `ArrayReverse` | supported | Declaration and applicable semantic checks passed |
| `ArraySlice` | omitted | TS2344: Type 'Array_["length"]' does not satisfy the constraint 'number'. |
| `ArraySplice` | omitted | TS2536: Type '"length"' cannot be used to index type 'T'. |
| `ArrayTail` | supported | Declaration and applicable semantic checks passed |
| `ArrayValues` | supported | Declaration and applicable semantic checks passed |
| `Asyncify` | supported | Declaration and applicable semantic checks passed |
| `AsyncReturnType` | supported | Declaration and applicable semantic checks passed |
| `CamelCase` | supported | Declaration and applicable semantic checks passed |
| `CamelCasedProperties` | supported | Declaration and applicable semantic checks passed |
| `CamelCasedPropertiesDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `CamelCaseOptions` | supported | Declaration and applicable semantic checks passed |
| `Class` | supported | Declaration and applicable semantic checks passed |
| `ConditionalExcept` | omitted | TS2536: Type '"length"' cannot be used to index type 'TArray'. |
| `ConditionalKeys` | omitted | TS2536: Type '"length"' cannot be used to index type 'TArray'. |
| `ConditionalPick` | omitted | TS2536: Type '"length"' cannot be used to index type 'TArray'. |
| `ConditionalPickDeep` | omitted | TS2536: Type '"length"' cannot be used to index type 'TArray'. |
| `ConditionalPickDeepOptions` | supported | Declaration and applicable semantic checks passed |
| `ConditionalSimplify` | supported | Declaration and applicable semantic checks passed |
| `ConditionalSimplifyDeep` | supported | Declaration and applicable semantic checks passed |
| `Constructor` | supported | Declaration and applicable semantic checks passed |
| `DelimiterCase` | supported | Declaration and applicable semantic checks passed |
| `DelimiterCasedProperties` | supported | Declaration and applicable semantic checks passed |
| `DelimiterCasedPropertiesDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `DigitCharacter` | supported | Declaration and applicable semantic checks passed |
| `DistributedOmit` | omitted | TS2344: Type 'KeyType' does not satisfy the constraint 'keyof ObjectType'.   Type 'keyof UnionToIntersection<ObjectType extends unknown ? Record<keyof ObjectType, never> : never>' is not assignable to type 'keyof ObjectType'.     Type 'string \| number \| symbol' is not assignable to type 'keyof ObjectType'.       Type 'string' is not assignable to type 'keyof ObjectType'. |
| `DistributedPick` | supported | Declaration and applicable semantic checks passed |
| `EmptyObject` | supported | Declaration and applicable semantic checks passed |
| `Entries` | supported | Declaration and applicable semantic checks passed |
| `Entry` | supported | Declaration and applicable semantic checks passed |
| `Exact` | supported | Declaration and applicable semantic checks passed |
| `Except` | supported | Declaration and applicable semantic checks passed |
| `ExceptOptions` | supported | Declaration and applicable semantic checks passed |
| `ExcludeExactly` | supported | Declaration and applicable semantic checks passed |
| `ExcludeRestElement` | supported | Declaration and applicable semantic checks passed |
| `ExcludeStrict` | supported | Declaration and applicable semantic checks passed |
| `ExclusifyUnion` | omitted | TS2304: Cannot find name 'Date'. |
| `ExtendsStrict` | supported | Declaration and applicable semantic checks passed |
| `ExtendsStrictOptions` | supported | Declaration and applicable semantic checks passed |
| `ExtractExactly` | supported | Declaration and applicable semantic checks passed |
| `ExtractRestElement` | supported | Declaration and applicable semantic checks passed |
| `ExtractStrict` | supported | Declaration and applicable semantic checks passed |
| `FindGlobalInstanceType` | supported | Declaration and applicable semantic checks passed |
| `FindGlobalType` | supported | Declaration and applicable semantic checks passed |
| `Finite` | supported | Declaration and applicable semantic checks passed |
| `FixedLengthArray` | omitted | TS2344: Type 'number \| "length" \| ArrayLengthMutationKeys' does not satisfy the constraint 'keyof TupleOf<Length, Element>'.   Type 'string' is not assignable to type 'keyof TupleOf<Length, Element>'.     Type '"length"' is not assignable to type '(number \| unique symbol \| "push" \| "pop" \| "shift" \| "unshift" \| "insert" \| "remove" \| "unorderedRemove" \| "sort" \| "clear" \| "isEmpty" \| "join" \| "move" \| "includes" \| "indexOf" \| ... 11 more ... \| "size") & keyof (IsNever<...> extends true ? [] : _TupleOf<...>)'. |
| `Float` | supported | Declaration and applicable semantic checks passed |
| `Get` | omitted | TS2304: Cannot find name 'Date'. |
| `GetOptions` | supported | Declaration and applicable semantic checks passed |
| `GetTagMetadata` | adapted | property-key |
| `GlobalThis` | supported | Declaration and applicable semantic checks passed |
| `GreaterThan` | omitted | TS2344: Type 'StringLength<A>' does not satisfy the constraint 'number'.   Type 'unknown' is not assignable to type 'number'. |
| `GreaterThanOrEqual` | omitted | TS2344: Type 'StringLength<A>' does not satisfy the constraint 'number'.   Type 'unknown' is not assignable to type 'number'. |
| `HasOptionalKeys` | supported | Declaration and applicable semantic checks passed |
| `HasReadonlyKeys` | supported | Declaration and applicable semantic checks passed |
| `HasRequiredKeys` | supported | Declaration and applicable semantic checks passed |
| `HasWritableKeys` | supported | Declaration and applicable semantic checks passed |
| `If` | supported | Declaration and applicable semantic checks passed |
| `IfAny` | supported | Declaration and applicable semantic checks passed |
| `IfEmptyObject` | supported | Declaration and applicable semantic checks passed |
| `IfNever` | supported | Declaration and applicable semantic checks passed |
| `IfNull` | supported | Declaration and applicable semantic checks passed |
| `IfUnknown` | supported | Declaration and applicable semantic checks passed |
| `Includes` | supported | Declaration and applicable semantic checks passed |
| `IntClosedRange` | omitted | TS2344: Type 'Magnitude["length"]' does not satisfy the constraint 'number'. |
| `Integer` | supported | Declaration and applicable semantic checks passed |
| `IntRange` | omitted | TS2344: Type 'Magnitude["length"]' does not satisfy the constraint 'number'. |
| `InvariantOf` | supported | Declaration and applicable semantic checks passed |
| `IsAny` | supported | Declaration and applicable semantic checks passed |
| `IsBooleanLiteral` | supported | Declaration and applicable semantic checks passed |
| `IsEmptyObject` | supported | Declaration and applicable semantic checks passed |
| `IsEqual` | supported | Declaration and applicable semantic checks passed |
| `IsFloat` | supported | Declaration and applicable semantic checks passed |
| `IsInteger` | supported | Declaration and applicable semantic checks passed |
| `IsLiteral` | supported | Declaration and applicable semantic checks passed |
| `IsLowercase` | supported | Declaration and applicable semantic checks passed |
| `IsNegative` | supported | Declaration and applicable semantic checks passed |
| `IsNever` | supported | Declaration and applicable semantic checks passed |
| `IsNull` | supported | Declaration and applicable semantic checks passed |
| `IsNullable` | supported | Declaration and applicable semantic checks passed |
| `IsNumericLiteral` | supported | Declaration and applicable semantic checks passed |
| `IsOptional` | supported | Declaration and applicable semantic checks passed |
| `IsOptionalKeyOf` | supported | Declaration and applicable semantic checks passed |
| `IsReadonlyKeyOf` | supported | Declaration and applicable semantic checks passed |
| `IsRequiredKeyOf` | supported | Declaration and applicable semantic checks passed |
| `IsStringLiteral` | supported | Declaration and applicable semantic checks passed |
| `IsSymbolLiteral` | supported | Declaration and applicable semantic checks passed |
| `IsTuple` | omitted | TS2536: Type '"length"' cannot be used to index type 'TArray'. |
| `IsTupleOptions` | supported | Declaration and applicable semantic checks passed |
| `IsUndefined` | supported | Declaration and applicable semantic checks passed |
| `IsUnion` | supported | Declaration and applicable semantic checks passed |
| `IsUnknown` | supported | Declaration and applicable semantic checks passed |
| `IsUppercase` | supported | Declaration and applicable semantic checks passed |
| `IsWritableKeyOf` | supported | Declaration and applicable semantic checks passed |
| `IterableElement` | supported | Declaration and applicable semantic checks passed |
| `Join` | supported | Declaration and applicable semantic checks passed |
| `JsonArray` | supported | Declaration and applicable semantic checks passed |
| `Jsonifiable` | supported | Declaration and applicable semantic checks passed |
| `Jsonify` | omitted | TS2304: Cannot find name 'Int8Array'. |
| `JsonObject` | supported | Declaration and applicable semantic checks passed |
| `JsonPrimitive` | supported | Declaration and applicable semantic checks passed |
| `JsonValue` | supported | Declaration and applicable semantic checks passed |
| `KebabCase` | supported | Declaration and applicable semantic checks passed |
| `KebabCasedProperties` | supported | Declaration and applicable semantic checks passed |
| `KebabCasedPropertiesDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `KeyAsString` | supported | Declaration and applicable semantic checks passed |
| `KeysOfUnion` | supported | Declaration and applicable semantic checks passed |
| `LastArrayElement` | supported | Declaration and applicable semantic checks passed |
| `LessThan` | omitted | TS2344: Type 'StringLength<A>' does not satisfy the constraint 'number'.   Type 'unknown' is not assignable to type 'number'. |
| `LessThanOrEqual` | omitted | TS2344: Type 'StringLength<A>' does not satisfy the constraint 'number'.   Type 'unknown' is not assignable to type 'number'. |
| `LiteralToPrimitive` | supported | Declaration and applicable semantic checks passed |
| `LiteralToPrimitiveDeep` | supported | Declaration and applicable semantic checks passed |
| `LiteralUnion` | supported | Declaration and applicable semantic checks passed |
| `LowercaseLetter` | supported | Declaration and applicable semantic checks passed |
| `Merge` | supported | Declaration and applicable semantic checks passed |
| `MergeDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `MergeDeepOptions` | supported | Declaration and applicable semantic checks passed |
| `MergeExclusive` | supported | Declaration and applicable semantic checks passed |
| `MultidimensionalArray` | omitted | TS2344: Type 'Subtract<Dimensions, 1>' does not satisfy the constraint 'number'.   Type '1 \| Dimensions \| (Dimensions extends never ? number : Dimensions extends -Infinity ? -Infinity : Dimensions extends Infinity ? Infinity : Dimensions extends 1 ? 0 : Dimensions extends 0 ? -1 : SubtractPostChecks<...>)' is not assignable to type 'number'.     Type 'Dimensions extends never ? number : Dimensions extends -Infinity ? -Infinity : Dimensions extends Infinity ? Infinity : Dimensions extends 1 ? 0 : Dimensions extends 0 ? -1 : SubtractPostChecks<...>' is not assignable to type 'number'.       Type 'unknown' is not assignable to type 'number'. |
| `MultidimensionalReadonlyArray` | omitted | TS2344: Type 'Subtract<Dimensions, 1>' does not satisfy the constraint 'number'.   Type '1 \| Dimensions \| (Dimensions extends never ? number : Dimensions extends -Infinity ? -Infinity : Dimensions extends Infinity ? Infinity : Dimensions extends 1 ? 0 : Dimensions extends 0 ? -1 : SubtractPostChecks<...>)' is not assignable to type 'number'.     Type 'Dimensions extends never ? number : Dimensions extends -Infinity ? -Infinity : Dimensions extends Infinity ? Infinity : Dimensions extends 1 ? 0 : Dimensions extends 0 ? -1 : SubtractPostChecks<...>' is not assignable to type 'number'.       Type 'unknown' is not assignable to type 'number'. |
| `Negative` | supported | Declaration and applicable semantic checks passed |
| `NegativeFloat` | supported | Declaration and applicable semantic checks passed |
| `NegativeInfinity` | supported | Declaration and applicable semantic checks passed |
| `NegativeInteger` | supported | Declaration and applicable semantic checks passed |
| `NonEmptyObject` | supported | Declaration and applicable semantic checks passed |
| `NonEmptyString` | supported | Declaration and applicable semantic checks passed |
| `NonEmptyTuple` | supported | Declaration and applicable semantic checks passed |
| `NonNegative` | supported | Declaration and applicable semantic checks passed |
| `NonNegativeInteger` | supported | Declaration and applicable semantic checks passed |
| `NonNullableDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `ObjectMerge` | omitted | TS2304: Cannot find name 'WeakKey'. |
| `OmitDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `OmitIndexSignature` | supported | Declaration and applicable semantic checks passed |
| `Opaque` | supported | Declaration and applicable semantic checks passed |
| `Optional` | supported | Declaration and applicable semantic checks passed |
| `OptionalKeysOf` | supported | Declaration and applicable semantic checks passed |
| `Or` | supported | Declaration and applicable semantic checks passed |
| `OrAll` | supported | Declaration and applicable semantic checks passed |
| `OverrideProperties` | supported | Declaration and applicable semantic checks passed |
| `PackageJson` | supported | Declaration and applicable semantic checks passed |
| `PartialDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `PartialDeepOptions` | supported | Declaration and applicable semantic checks passed |
| `PartialOnUndefinedDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `PartialOnUndefinedDeepOptions` | supported | Declaration and applicable semantic checks passed |
| `PascalCase` | supported | Declaration and applicable semantic checks passed |
| `PascalCasedProperties` | supported | Declaration and applicable semantic checks passed |
| `PascalCasedPropertiesDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `Paths` | omitted | TS2304: Cannot find name 'Date'. |
| `PathsOptions` | supported | Declaration and applicable semantic checks passed |
| `PickDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `PickIndexSignature` | supported | Declaration and applicable semantic checks passed |
| `PositiveInfinity` | supported | Declaration and applicable semantic checks passed |
| `Primitive` | supported | Declaration and applicable semantic checks passed |
| `Promisable` | supported | Declaration and applicable semantic checks passed |
| `ReadonlyDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `ReadonlyKeysOf` | supported | Declaration and applicable semantic checks passed |
| `ReadonlyTuple` | supported | Declaration and applicable semantic checks passed |
| `RemovePrefix` | supported | Declaration and applicable semantic checks passed |
| `RemovePrefixOptions` | supported | Declaration and applicable semantic checks passed |
| `RemoveSuffix` | supported | Declaration and applicable semantic checks passed |
| `RemoveSuffixOptions` | supported | Declaration and applicable semantic checks passed |
| `RenameKeys` | omitted | TS2322: Type 'Counter["length"]' is not assignable to type 'string \| number \| bigint \| boolean \| null \| undefined'. |
| `Replace` | supported | Declaration and applicable semantic checks passed |
| `ReplaceOptions` | supported | Declaration and applicable semantic checks passed |
| `RequireAllOrNone` | adapted | property-key |
| `RequireAtLeastOne` | supported | Declaration and applicable semantic checks passed |
| `RequiredDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `RequiredKeysOf` | supported | Declaration and applicable semantic checks passed |
| `RequireExactlyOne` | supported | Declaration and applicable semantic checks passed |
| `RequireOneOrNone` | adapted | property-key |
| `Schema` | omitted | TS2304: Cannot find name 'Date'. |
| `SchemaOptions` | supported | Declaration and applicable semantic checks passed |
| `ScreamingSnakeCase` | supported | Declaration and applicable semantic checks passed |
| `SetFieldType` | supported | Declaration and applicable semantic checks passed |
| `SetFieldTypeOptions` | supported | Declaration and applicable semantic checks passed |
| `SetNonNullable` | supported | Declaration and applicable semantic checks passed |
| `SetNonNullableDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `SetOptional` | supported | Declaration and applicable semantic checks passed |
| `SetParameterType` | omitted | TS2536: Type '"length"' cannot be used to index type 'TObject'. |
| `SetReadonly` | supported | Declaration and applicable semantic checks passed |
| `SetRequired` | omitted | TS2322: Type 'Counter["length"]' is not assignable to type 'string \| number \| bigint \| boolean \| null \| undefined'. |
| `SetRequiredDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `SetReturnType` | supported | Declaration and applicable semantic checks passed |
| `SharedUnionFields` | omitted | TS2304: Cannot find name 'Date'. |
| `SharedUnionFieldsDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `SharedUnionFieldsDeepOptions` | supported | Declaration and applicable semantic checks passed |
| `Simplify` | supported | Declaration and applicable semantic checks passed |
| `SimplifyDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `SingleKeyObject` | supported | Declaration and applicable semantic checks passed |
| `SnakeCase` | supported | Declaration and applicable semantic checks passed |
| `SnakeCasedProperties` | supported | Declaration and applicable semantic checks passed |
| `SnakeCasedPropertiesDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `SomeExtend` | supported | Declaration and applicable semantic checks passed |
| `SomeExtendOptions` | supported | Declaration and applicable semantic checks passed |
| `Split` | supported | Declaration and applicable semantic checks passed |
| `SplitOnRestElement` | supported | Declaration and applicable semantic checks passed |
| `SplitOptions` | supported | Declaration and applicable semantic checks passed |
| `Spread` | supported | Declaration and applicable semantic checks passed |
| `Stringified` | supported | Declaration and applicable semantic checks passed |
| `StringLength` | omitted | TS2536: Type '"length"' cannot be used to index type 'StringToArray<S>'. |
| `StringRepeat` | supported | Declaration and applicable semantic checks passed |
| `StringSlice` | omitted | TS2344: Type 'Array_["length"]' does not satisfy the constraint 'number'. |
| `StringToArray` | supported | Declaration and applicable semantic checks passed |
| `StringToArrayOptions` | supported | Declaration and applicable semantic checks passed |
| `StringToNumber` | supported | Declaration and applicable semantic checks passed |
| `StructuredCloneable` | omitted | TS2304: Cannot find name 'ArrayBuffer'. |
| `Subtract` | omitted | TS2344: Type 'SubtractPositives<Absolute<A>, Absolute<B>>' does not satisfy the constraint 'number'.   Type 'ReverseSign<SubtractIfAGreaterThanB<Absolute<B>, Absolute<A>>> \| SubtractIfAGreaterThanB<Absolute<A>, Absolute<B>>' is not assignable to type 'number'.     Type 'SubtractIfAGreaterThanB<Absolute<A>, Absolute<B>>' is not assignable to type 'number'.       Type 'unknown' is not assignable to type 'number'. |
| `Sum` | omitted | TS2536: Type '"length"' cannot be used to index type '[...TupleOf<A>, ...TupleOf<B>]'. |
| `Tagged` | adapted | property-key |
| `TaggedUnion` | supported | Declaration and applicable semantic checks passed |
| `Trim` | supported | Declaration and applicable semantic checks passed |
| `TsConfigJson` | supported | Declaration and applicable semantic checks passed |
| `TupleOf` | supported | Declaration and applicable semantic checks passed |
| `TupleToObject` | omitted | TS2536: Type '"length"' cannot be used to index type 'TArray'. |
| `TupleToUnion` | supported | Declaration and applicable semantic checks passed |
| `TypedArray` | omitted | TS2304: Cannot find name 'Int8Array'. |
| `UndefinedOnPartialDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `UnionLength` | omitted | TS2536: Type '"length"' cannot be used to index type 'UnionToTuple<Union>'. |
| `UnionMax` | omitted | TS2536: Type '"length"' cannot be used to index type 'Counter'. |
| `UnionMember` | supported | Declaration and applicable semantic checks passed |
| `UnionToIntersection` | supported | Declaration and applicable semantic checks passed |
| `UnionToTuple` | supported | Declaration and applicable semantic checks passed |
| `UnknownArray` | supported | Declaration and applicable semantic checks passed |
| `UnknownMap` | supported | Declaration and applicable semantic checks passed |
| `UnknownRecord` | adapted | property-key |
| `UnknownSet` | supported | Declaration and applicable semantic checks passed |
| `UnwrapOpaque` | adapted | property-key |
| `UnwrapPartial` | supported | Declaration and applicable semantic checks passed |
| `UnwrapRequired` | omitted | TS2304: Cannot find name 'Date'. |
| `UnwrapTagged` | adapted | property-key |
| `UppercaseLetter` | supported | Declaration and applicable semantic checks passed |
| `ValueOf` | supported | Declaration and applicable semantic checks passed |
| `Words` | supported | Declaration and applicable semantic checks passed |
| `WordsOptions` | supported | Declaration and applicable semantic checks passed |
| `Writable` | supported | Declaration and applicable semantic checks passed |
| `WritableDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `WritableKeysOf` | supported | Declaration and applicable semantic checks passed |
| `Xor` | supported | Declaration and applicable semantic checks passed |

`/globals` is omitted: upstream global augmentations alter the Roblox ambient environment.
<!-- coverage:end -->
