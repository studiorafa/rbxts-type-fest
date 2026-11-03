# Compatibility

Type-Fest **5.10.0**: **191/250** types available.

Removed since the previous generated version: none.

| Export | Status | Reason |
| --- | --- | --- |
| `Absolute` | supported | Available |
| `AbstractClass` | supported | Available |
| `AbstractConstructor` | supported | Available |
| `AllExtend` | supported | Available |
| `AllExtendOptions` | supported | Available |
| `AllUnionFields` | omitted | TS2304: Cannot find name 'Date'. |
| `Alphanumeric` | supported | Available |
| `And` | supported | Available |
| `AndAll` | supported | Available |
| `Arrayable` | supported | Available |
| `ArrayElement` | supported | Available |
| `ArrayIndices` | omitted | TS2536: Type '"length"' cannot be used to index type 'Partial<Element>'. |
| `ArrayLength` | omitted | TS2536: Type '"length"' cannot be used to index type 'T'. |
| `ArrayReverse` | supported | Available |
| `ArraySlice` | omitted | TS2344: Type 'Array_["length"]' does not satisfy the constraint 'number'. |
| `ArraySplice` | omitted | TS2536: Type '"length"' cannot be used to index type 'T'. |
| `ArrayTail` | supported | Available |
| `ArrayValues` | supported | Available |
| `Asyncify` | supported | Available |
| `AsyncReturnType` | supported | Available |
| `CamelCase` | supported | Available |
| `CamelCasedProperties` | supported | Available |
| `CamelCasedPropertiesDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `CamelCaseOptions` | supported | Available |
| `Class` | supported | Available |
| `ConditionalExcept` | omitted | TS2536: Type '"length"' cannot be used to index type 'TArray'. |
| `ConditionalKeys` | omitted | TS2536: Type '"length"' cannot be used to index type 'TArray'. |
| `ConditionalPick` | omitted | TS2536: Type '"length"' cannot be used to index type 'TArray'. |
| `ConditionalPickDeep` | omitted | TS2536: Type '"length"' cannot be used to index type 'TArray'. |
| `ConditionalPickDeepOptions` | supported | Available |
| `ConditionalSimplify` | supported | Available |
| `ConditionalSimplifyDeep` | supported | Available |
| `Constructor` | supported | Available |
| `DelimiterCase` | supported | Available |
| `DelimiterCasedProperties` | supported | Available |
| `DelimiterCasedPropertiesDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `DigitCharacter` | supported | Available |
| `DistributedOmit` | omitted | TS2344: Type 'KeyType' does not satisfy the constraint 'keyof ObjectType'.   Type 'keyof UnionToIntersection<ObjectType extends unknown ? Record<keyof ObjectType, never> : never>' is not assignable to type 'keyof ObjectType'.     Type 'string \| number \| symbol' is not assignable to type 'keyof ObjectType'.       Type 'string' is not assignable to type 'keyof ObjectType'. |
| `DistributedPick` | supported | Available |
| `EmptyObject` | supported | Available |
| `Entries` | supported | Available |
| `Entry` | supported | Available |
| `Exact` | supported | Available |
| `Except` | supported | Available |
| `ExceptOptions` | supported | Available |
| `ExcludeExactly` | supported | Available |
| `ExcludeRestElement` | supported | Available |
| `ExcludeStrict` | supported | Available |
| `ExclusifyUnion` | omitted | TS2304: Cannot find name 'Date'. |
| `ExtendsStrict` | supported | Available |
| `ExtendsStrictOptions` | supported | Available |
| `ExtractExactly` | supported | Available |
| `ExtractRestElement` | supported | Available |
| `ExtractStrict` | supported | Available |
| `FindGlobalInstanceType` | supported | Available |
| `FindGlobalType` | supported | Available |
| `Finite` | supported | Available |
| `FixedLengthArray` | omitted | TS2344: Type 'number \| "length" \| ArrayLengthMutationKeys' does not satisfy the constraint 'keyof TupleOf<Length, Element>'.   Type 'string' is not assignable to type 'keyof TupleOf<Length, Element>'.     Type '"length"' is not assignable to type '(number \| unique symbol \| "push" \| "pop" \| "shift" \| "unshift" \| "insert" \| "remove" \| "unorderedRemove" \| "sort" \| "clear" \| "isEmpty" \| "join" \| "move" \| "includes" \| "indexOf" \| ... 11 more ... \| "size") & keyof (IsNever<...> extends true ? [] : _TupleOf<...>)'. |
| `Float` | supported | Available |
| `Get` | omitted | TS2304: Cannot find name 'Date'. |
| `GetOptions` | supported | Available |
| `GetTagMetadata` | adapted | property-key |
| `GlobalThis` | supported | Available |
| `GreaterThan` | omitted | TS2344: Type 'StringLength<A>' does not satisfy the constraint 'number'.   Type 'unknown' is not assignable to type 'number'. |
| `GreaterThanOrEqual` | omitted | TS2344: Type 'StringLength<A>' does not satisfy the constraint 'number'.   Type 'unknown' is not assignable to type 'number'. |
| `HasOptionalKeys` | supported | Available |
| `HasReadonlyKeys` | supported | Available |
| `HasRequiredKeys` | supported | Available |
| `HasWritableKeys` | supported | Available |
| `If` | supported | Available |
| `IfAny` | supported | Available |
| `IfEmptyObject` | supported | Available |
| `IfNever` | supported | Available |
| `IfNull` | supported | Available |
| `IfUnknown` | supported | Available |
| `Includes` | supported | Available |
| `IntClosedRange` | omitted | TS2344: Type 'Magnitude["length"]' does not satisfy the constraint 'number'. |
| `Integer` | supported | Available |
| `IntRange` | omitted | TS2344: Type 'Magnitude["length"]' does not satisfy the constraint 'number'. |
| `InvariantOf` | supported | Available |
| `IsAny` | supported | Available |
| `IsBooleanLiteral` | supported | Available |
| `IsEmptyObject` | supported | Available |
| `IsEqual` | supported | Available |
| `IsFloat` | supported | Available |
| `IsInteger` | supported | Available |
| `IsLiteral` | supported | Available |
| `IsLowercase` | supported | Available |
| `IsNegative` | supported | Available |
| `IsNever` | supported | Available |
| `IsNull` | supported | Available |
| `IsNullable` | supported | Available |
| `IsNumericLiteral` | supported | Available |
| `IsOptional` | supported | Available |
| `IsOptionalKeyOf` | supported | Available |
| `IsReadonlyKeyOf` | supported | Available |
| `IsRequiredKeyOf` | supported | Available |
| `IsStringLiteral` | supported | Available |
| `IsSymbolLiteral` | supported | Available |
| `IsTuple` | omitted | TS2536: Type '"length"' cannot be used to index type 'TArray'. |
| `IsTupleOptions` | supported | Available |
| `IsUndefined` | supported | Available |
| `IsUnion` | supported | Available |
| `IsUnknown` | supported | Available |
| `IsUppercase` | supported | Available |
| `IsWritableKeyOf` | supported | Available |
| `IterableElement` | supported | Available |
| `Join` | supported | Available |
| `JsonArray` | supported | Available |
| `Jsonifiable` | supported | Available |
| `Jsonify` | omitted | TS2304: Cannot find name 'Int8Array'. |
| `JsonObject` | supported | Available |
| `JsonPrimitive` | supported | Available |
| `JsonValue` | supported | Available |
| `KebabCase` | supported | Available |
| `KebabCasedProperties` | supported | Available |
| `KebabCasedPropertiesDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `KeyAsString` | supported | Available |
| `KeysOfUnion` | supported | Available |
| `LastArrayElement` | supported | Available |
| `LessThan` | omitted | TS2344: Type 'StringLength<A>' does not satisfy the constraint 'number'.   Type 'unknown' is not assignable to type 'number'. |
| `LessThanOrEqual` | omitted | TS2344: Type 'StringLength<A>' does not satisfy the constraint 'number'.   Type 'unknown' is not assignable to type 'number'. |
| `LiteralToPrimitive` | supported | Available |
| `LiteralToPrimitiveDeep` | supported | Available |
| `LiteralUnion` | supported | Available |
| `LowercaseLetter` | supported | Available |
| `Merge` | supported | Available |
| `MergeDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `MergeDeepOptions` | supported | Available |
| `MergeExclusive` | supported | Available |
| `MultidimensionalArray` | omitted | TS2344: Type 'Subtract<Dimensions, 1>' does not satisfy the constraint 'number'.   Type '1 \| Dimensions \| (Dimensions extends never ? number : Dimensions extends -Infinity ? -Infinity : Dimensions extends Infinity ? Infinity : Dimensions extends 1 ? 0 : Dimensions extends 0 ? -1 : SubtractPostChecks<...>)' is not assignable to type 'number'.     Type 'Dimensions extends never ? number : Dimensions extends -Infinity ? -Infinity : Dimensions extends Infinity ? Infinity : Dimensions extends 1 ? 0 : Dimensions extends 0 ? -1 : SubtractPostChecks<...>' is not assignable to type 'number'.       Type 'unknown' is not assignable to type 'number'. |
| `MultidimensionalReadonlyArray` | omitted | TS2344: Type 'Subtract<Dimensions, 1>' does not satisfy the constraint 'number'.   Type '1 \| Dimensions \| (Dimensions extends never ? number : Dimensions extends -Infinity ? -Infinity : Dimensions extends Infinity ? Infinity : Dimensions extends 1 ? 0 : Dimensions extends 0 ? -1 : SubtractPostChecks<...>)' is not assignable to type 'number'.     Type 'Dimensions extends never ? number : Dimensions extends -Infinity ? -Infinity : Dimensions extends Infinity ? Infinity : Dimensions extends 1 ? 0 : Dimensions extends 0 ? -1 : SubtractPostChecks<...>' is not assignable to type 'number'.       Type 'unknown' is not assignable to type 'number'. |
| `Negative` | supported | Available |
| `NegativeFloat` | supported | Available |
| `NegativeInfinity` | supported | Available |
| `NegativeInteger` | supported | Available |
| `NonEmptyObject` | supported | Available |
| `NonEmptyString` | supported | Available |
| `NonEmptyTuple` | supported | Available |
| `NonNegative` | supported | Available |
| `NonNegativeInteger` | supported | Available |
| `NonNullableDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `ObjectMerge` | omitted | TS2304: Cannot find name 'WeakKey'. |
| `OmitDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `OmitIndexSignature` | supported | Available |
| `Opaque` | supported | Available |
| `Optional` | supported | Available |
| `OptionalKeysOf` | supported | Available |
| `Or` | supported | Available |
| `OrAll` | supported | Available |
| `OverrideProperties` | supported | Available |
| `PackageJson` | supported | Available |
| `PartialDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `PartialDeepOptions` | supported | Available |
| `PartialOnUndefinedDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `PartialOnUndefinedDeepOptions` | supported | Available |
| `PascalCase` | supported | Available |
| `PascalCasedProperties` | supported | Available |
| `PascalCasedPropertiesDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `Paths` | omitted | TS2304: Cannot find name 'Date'. |
| `PathsOptions` | supported | Available |
| `PickDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `PickIndexSignature` | supported | Available |
| `PositiveInfinity` | supported | Available |
| `Primitive` | supported | Available |
| `Promisable` | supported | Available |
| `ReadonlyDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `ReadonlyKeysOf` | supported | Available |
| `ReadonlyTuple` | supported | Available |
| `RemovePrefix` | supported | Available |
| `RemovePrefixOptions` | supported | Available |
| `RemoveSuffix` | supported | Available |
| `RemoveSuffixOptions` | supported | Available |
| `RenameKeys` | omitted | TS2322: Type 'Counter["length"]' is not assignable to type 'string \| number \| bigint \| boolean \| null \| undefined'. |
| `Replace` | supported | Available |
| `ReplaceOptions` | supported | Available |
| `RequireAllOrNone` | adapted | property-key |
| `RequireAtLeastOne` | supported | Available |
| `RequiredDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `RequiredKeysOf` | supported | Available |
| `RequireExactlyOne` | supported | Available |
| `RequireOneOrNone` | adapted | property-key |
| `Schema` | omitted | TS2304: Cannot find name 'Date'. |
| `SchemaOptions` | supported | Available |
| `ScreamingSnakeCase` | supported | Available |
| `SetFieldType` | supported | Available |
| `SetFieldTypeOptions` | supported | Available |
| `SetNonNullable` | supported | Available |
| `SetNonNullableDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `SetOptional` | supported | Available |
| `SetParameterType` | omitted | TS2536: Type '"length"' cannot be used to index type 'TObject'. |
| `SetReadonly` | supported | Available |
| `SetRequired` | omitted | TS2322: Type 'Counter["length"]' is not assignable to type 'string \| number \| bigint \| boolean \| null \| undefined'. |
| `SetRequiredDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `SetReturnType` | supported | Available |
| `SharedUnionFields` | omitted | TS2304: Cannot find name 'Date'. |
| `SharedUnionFieldsDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `SharedUnionFieldsDeepOptions` | supported | Available |
| `Simplify` | supported | Available |
| `SimplifyDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `SingleKeyObject` | supported | Available |
| `SnakeCase` | supported | Available |
| `SnakeCasedProperties` | supported | Available |
| `SnakeCasedPropertiesDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `SomeExtend` | supported | Available |
| `SomeExtendOptions` | supported | Available |
| `Split` | supported | Available |
| `SplitOnRestElement` | supported | Available |
| `SplitOptions` | supported | Available |
| `Spread` | supported | Available |
| `Stringified` | supported | Available |
| `StringLength` | omitted | TS2536: Type '"length"' cannot be used to index type 'StringToArray<S>'. |
| `StringRepeat` | supported | Available |
| `StringSlice` | omitted | TS2344: Type 'Array_["length"]' does not satisfy the constraint 'number'. |
| `StringToArray` | supported | Available |
| `StringToArrayOptions` | supported | Available |
| `StringToNumber` | supported | Available |
| `StructuredCloneable` | omitted | TS2304: Cannot find name 'ArrayBuffer'. |
| `Subtract` | omitted | TS2344: Type 'SubtractPositives<Absolute<A>, Absolute<B>>' does not satisfy the constraint 'number'.   Type 'ReverseSign<SubtractIfAGreaterThanB<Absolute<B>, Absolute<A>>> \| SubtractIfAGreaterThanB<Absolute<A>, Absolute<B>>' is not assignable to type 'number'.     Type 'SubtractIfAGreaterThanB<Absolute<A>, Absolute<B>>' is not assignable to type 'number'.       Type 'unknown' is not assignable to type 'number'. |
| `Sum` | omitted | TS2536: Type '"length"' cannot be used to index type '[...TupleOf<A>, ...TupleOf<B>]'. |
| `Tagged` | adapted | property-key |
| `TaggedUnion` | supported | Available |
| `Trim` | supported | Available |
| `TsConfigJson` | supported | Available |
| `TupleOf` | supported | Available |
| `TupleToObject` | omitted | TS2536: Type '"length"' cannot be used to index type 'TArray'. |
| `TupleToUnion` | supported | Available |
| `TypedArray` | omitted | TS2304: Cannot find name 'Int8Array'. |
| `UndefinedOnPartialDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `UnionLength` | omitted | TS2536: Type '"length"' cannot be used to index type 'UnionToTuple<Union>'. |
| `UnionMax` | omitted | TS2536: Type '"length"' cannot be used to index type 'Counter'. |
| `UnionMember` | supported | Available |
| `UnionToIntersection` | supported | Available |
| `UnionToTuple` | supported | Available |
| `UnknownArray` | supported | Available |
| `UnknownMap` | supported | Available |
| `UnknownRecord` | adapted | property-key |
| `UnknownSet` | supported | Available |
| `UnwrapOpaque` | adapted | property-key |
| `UnwrapPartial` | supported | Available |
| `UnwrapRequired` | omitted | TS2304: Cannot find name 'Date'. |
| `UnwrapTagged` | adapted | property-key |
| `UppercaseLetter` | supported | Available |
| `ValueOf` | supported | Available |
| `Words` | supported | Available |
| `WordsOptions` | supported | Available |
| `Writable` | supported | Available |
| `WritableDeep` | omitted | TS2304: Cannot find name 'Date'. |
| `WritableKeysOf` | supported | Available |
| `Xor` | supported | Available |

`/globals` is unavailable because it changes Roblox's global declarations.
