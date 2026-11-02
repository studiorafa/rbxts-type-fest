import type {UnknownArray} from "../unknown-array.d.ts";
import type {IfNotAnyOrNever} from "./type.d.ts";
import type {If} from "../if.d.ts";
import type {IsExactOptionalPropertyTypesEnabled} from "./type.d.ts";
import type {IsNever} from "../is-never.d.ts";
/**
Returns whether the given array `T` is readonly.
*/
export type IsArrayReadonly<T extends UnknownArray> = If<IsNever<T>, false, T extends unknown[] ? false : true>;
/**
Transforms a tuple type by replacing it's rest element with a single element that has the same type as the rest element, while keeping all the non-rest elements intact.

@example
```
type A = CollapseRestElement<[string, string, ...number[]]>;
//=> [string, string, number]

type B = CollapseRestElement<[...string[], number, number]>;
//=> [string, number, number]

type C = CollapseRestElement<[string, string, ...Array<number | bigint>]>;
//=> [string, string, number | bigint]

type D = CollapseRestElement<[string, number]>;
//=> [string, number]
```

Note: Optional modifiers (`?`) are removed from elements unless the `exactOptionalPropertyTypes` compiler option is disabled. When disabled, there's an additional `| undefined` for optional elements.

@example
```
// `exactOptionalPropertyTypes` enabled
type A = CollapseRestElement<[string?, string?, ...number[]]>;
//=> [string, string, number]

// `exactOptionalPropertyTypes` disabled
type B = CollapseRestElement<[string?, string?, ...number[]]>;
//=> [string | undefined, string | undefined, number]
```
*/
export type CollapseRestElement<TArray extends UnknownArray> = IfNotAnyOrNever<TArray, {
    ifNot: _CollapseRestElement<TArray>;
}>;
type _CollapseRestElement<TArray extends UnknownArray, ForwardAccumulator extends UnknownArray = [
], BackwardAccumulator extends UnknownArray = [
]> = TArray extends UnknownArray // For distributing `TArray`
 ? '0' extends keyof TArray ? TArray extends readonly [
    (infer First)?,
    ...infer Rest
] ? _CollapseRestElement<Rest, [
    ...ForwardAccumulator,
    // A tuple allows fewer than one element only when its first element is optional. Written in exactly this shape because equivalent ones, such as `[] extends TArray`, are several times slower.
    TArray extends readonly [
        unknown,
        ...unknown[]
    ] ? First : If<IsExactOptionalPropertyTypesEnabled, First, First | undefined>
], BackwardAccumulator> : never // Should never happen, since `[(infer First)?, ...infer Rest]` is a top-type for arrays.
 : TArray extends readonly [
    ...infer Rest,
    infer Last
] ? _CollapseRestElement<Rest, ForwardAccumulator, [
    Last,
    ...BackwardAccumulator
]> // Accumulate elements that are present after the rest element.
 : TArray extends readonly [
] ? [
    ...ForwardAccumulator,
    ...BackwardAccumulator
] : [
    ...ForwardAccumulator,
    TArray[number],
    ...BackwardAccumulator
] // Add the rest element between the accumulated elements.
 : never; // Should never happen

