import type {IsAny} from "../is-any.d.ts";
import type {IsNever} from "../is-never.d.ts";
/**
Returns a boolean for whether A is false.

@example
```
type A = Not<true>;
//=> false

type B = Not<false>;
//=> true
```
*/
export type Not<A extends boolean> = A extends true ? false : A extends false ? true : never;
/**
An if-else-like type that resolves depending on whether the given type is `any` or `never`.

@example
```
// When `T` is neither `any` nor `never` (like `string`) => Returns `IfNot` branch
type A = IfNotAnyOrNever<string, {ifNot: 'VALID'; ifAny: 'IS_ANY'; ifNever: 'IS_NEVER'}>;
//=> 'VALID'

// When `T` is `any` => Returns `IfAny` branch
type B = IfNotAnyOrNever<any, {ifNot: 'VALID'; ifAny: 'IS_ANY'; ifNever: 'IS_NEVER'}>;
//=> 'IS_ANY'

// When `T` is `never` => Returns `IfNever` branch
type C = IfNotAnyOrNever<never, {ifNot: 'VALID'; ifAny: 'IS_ANY'; ifNever: 'IS_NEVER'}>;
//=> 'IS_NEVER'
```

Note: Wrapping a tail-recursive type with `IfNotAnyOrNever` makes the implementation non-tail-recursive. To fix this, move the recursion into a helper type. Refer to the following example:

@example
```ts
import type {StringRepeat} from 'type-fest';

type NineHundredNinetyNineSpaces = StringRepeat<' ', 999>;

// The following implementation is not tail recursive
type TrimLeft<S extends string> = IfNotAnyOrNever<S, {ifNot: S extends ` ${infer R}` ? TrimLeft<R> : S}>;

// Hence, instantiations with long strings will fail
// @ts-expect-error
type T1 = TrimLeft<NineHundredNinetyNineSpaces>;
//        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Error: Type instantiation is excessively deep and possibly infinite.

// To fix this, move the recursion into a helper type
type TrimLeftOptimised<S extends string> = IfNotAnyOrNever<S, {ifNot: _TrimLeftOptimised<S>}>;

type _TrimLeftOptimised<S extends string> = S extends ` ${infer R}` ? _TrimLeftOptimised<R> : S;

type T2 = TrimLeftOptimised<NineHundredNinetyNineSpaces>;
//=> ''
```
*/
export type IfNotAnyOrNever<T, Cases extends {
    ifNot: unknown;
    ifAny?: unknown;
    ifNever?: unknown;
}> = IsAny<T> extends true ? 'ifAny' extends keyof Cases ? Cases['ifAny'] : any : IsNever<T> extends true ? 'ifNever' extends keyof Cases ? Cases['ifNever'] : never : Cases['ifNot'];
/**
Indicates the value of `exactOptionalPropertyTypes` compiler option.
*/
export type IsExactOptionalPropertyTypesEnabled = [
    (string | undefined)?
] extends [
    string?
] ? false : true;
