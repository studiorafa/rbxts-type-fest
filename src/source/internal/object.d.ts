import type {Simplify} from "../simplify.d.ts";
import type {RequiredKeysOf} from "../required-keys-of.d.ts";
import type {If} from "../if.d.ts";
import type {IsAny} from "../is-any.d.ts";
import type {IsNever} from "../is-never.d.ts";
import type {Merge} from "../merge.d.ts";
import type {IfNotAnyOrNever} from "./type.d.ts";
import type {Primitive} from "../primitive.d.ts";
import type {KeysOfUnion} from "../keys-of-union.d.ts";
import type {ToString} from "./string.d.ts";
/**
Extract the object field type if T is an object and K is a key of T, return `never` otherwise.

It creates a type-safe way to access the member type of `unknown` type.
*/
export type ObjectValue<T, K> = K extends keyof T ? T[K] : ToString<K> extends keyof T ? T[ToString<K>] : K extends `${infer NumberK extends number}` ? NumberK extends keyof T ? T[NumberK] : never : never;
/**
Works similar to the built-in `Pick` utility type, except for the following differences:
- Distributes over union types and allows picking keys from any member of the union type.
- Primitives types are returned as-is.
- Picks all keys if `Keys` is `any`.
- Doesn't pick `number` from a `string` index signature.

@example
```
type ImageUpload = {
    url: string;
    size: number;
    thumbnailUrl: string;
};

type VideoUpload = {
    url: string;
    duration: number;
    encodingFormat: string;
};

// Distributes over union types and allows picking keys from any member of the union type
type MediaDisplay = HomomorphicPick<ImageUpload | VideoUpload, "url" | "size" | "duration">;
//=> {url: string; size: number} | {url: string; duration: number}

// Primitive types are returned as-is
type Primitive = HomomorphicPick<string | number, 'toUpperCase' | 'toString'>;
//=> string | number

// Picks all keys if `Keys` is `any`
type Any = HomomorphicPick<{a: 1; b: 2} | {c: 3}, any>;
//=> {a: 1; b: 2} | {c: 3}

// Doesn't pick `number` from a `string` index signature
type IndexSignature = HomomorphicPick<{[k: string]: unknown}, number>;
//=> {}
*/
export type HomomorphicPick<T, Keys extends KeysOfUnion<T>> = {
    [P in keyof T as Extract<P, Keys>]: T[P];
};
/**
Merges user specified options with default options.

@example
```
type PathsOptions = {maxRecursionDepth?: number; leavesOnly?: boolean};
type DefaultPathsOptions = {maxRecursionDepth: 10; leavesOnly: false};
type SpecifiedOptions = {leavesOnly: true};

type Result = ApplyDefaultOptions<PathsOptions, DefaultPathsOptions, SpecifiedOptions>;
//=> {maxRecursionDepth: 10; leavesOnly: true}
```

@example
```
// Complains if default values are not provided for optional options

type PathsOptions = {maxRecursionDepth?: number; leavesOnly?: boolean};
type DefaultPathsOptions = {maxRecursionDepth: 10};
type SpecifiedOptions = {};

type Result = ApplyDefaultOptions<PathsOptions, DefaultPathsOptions, SpecifiedOptions>;
//                                              ~~~~~~~~~~~~~~~~~~~
// Property 'leavesOnly' is missing in type 'DefaultPathsOptions' but required in type '{ maxRecursionDepth: number; leavesOnly: boolean; }'.
```

@example
```
// Complains if an option's default type does not conform to the expected type

type PathsOptions = {maxRecursionDepth?: number; leavesOnly?: boolean};
type DefaultPathsOptions = {maxRecursionDepth: 10; leavesOnly: 'no'};
type SpecifiedOptions = {};

type Result = ApplyDefaultOptions<PathsOptions, DefaultPathsOptions, SpecifiedOptions>;
//                                              ~~~~~~~~~~~~~~~~~~~
// Types of property 'leavesOnly' are incompatible. Type 'string' is not assignable to type 'boolean'.
```

@example
```
// Complains if an option's specified type does not conform to the expected type

type PathsOptions = {maxRecursionDepth?: number; leavesOnly?: boolean};
type DefaultPathsOptions = {maxRecursionDepth: 10; leavesOnly: false};
type SpecifiedOptions = {leavesOnly: 'yes'};

type Result = ApplyDefaultOptions<PathsOptions, DefaultPathsOptions, SpecifiedOptions>;
//                                                                   ~~~~~~~~~~~~~~~~
// Types of property 'leavesOnly' are incompatible. Type 'string' is not assignable to type 'boolean'.
```
*/
export type ApplyDefaultOptions<Options extends object, Defaults extends Simplify<Omit<Required<Options>, RequiredKeysOf<Options>> & Partial<Record<RequiredKeysOf<Options>, never>>>, SpecifiedOptions extends Options> = _ApplyDefaultOptions<Options, Defaults, SpecifiedOptions> extends infer Result extends Required<Options> // `extends Required<Options>` ensures that `ApplyDefaultOptions<SomeOption, ...>` is always assignable to `Required<SomeOption>`
 ? Result : never;
type _ApplyDefaultOptions<Options, Defaults, SpecifiedOptions> = If<IsAny<SpecifiedOptions>, Defaults, If<IsNever<SpecifiedOptions>, Defaults, Merge<Defaults, {
    [Key in keyof SpecifiedOptions as undefined extends Required<Options>[Key & keyof Options] ? Key : undefined extends SpecifiedOptions[Key] ? never : Key]: SpecifiedOptions[Key];
}>>>;
/**
Collapses literal types in a union into their corresponding primitive types, when possible. For example, `CollapseLiterals<'foo' | 'bar' | (string & {})>` returns `string`.

Note: This doesn't collapse literals within tagged types. For example, `CollapseLiterals<Tagged<'foo' | (string & {}), 'Tag'>>` returns `("foo" & Tag<"Tag", never>) | (string & Tag<"Tag", never>)` and not `string & Tag<"Tag", never>`.

Use-case: For collapsing unions created using {@link LiteralUnion}.

@example
```
import type {LiteralUnion} from 'type-fest';

type A = CollapseLiterals<'foo' | 'bar' | (string & {})>;
//=> string

type B = CollapseLiterals<LiteralUnion<1 | 2 | 3, number>>;
//=> number

type C = CollapseLiterals<LiteralUnion<'onClick' | 'onChange', `on${string}`>>;
//=> `on${string}`

type D = CollapseLiterals<'click' | 'change' | (`on${string}` & {})>;
//=> 'click' | 'change' | `on${string}`

type E = CollapseLiterals<LiteralUnion<'foo' | 'bar', string> | null | undefined>;
//=> string | null | undefined
```
*/
export type CollapseLiterals<T> = {} extends T ? T : T extends infer U & {} ? U : T;
/**
Returns the base type of a branded type.

@example
```
type Brand = {readonly __brand: unique symbol};

type A = UnwrapBrand<string & Brand>;
//=> string

type B = UnwrapBrand<number & Brand>;
//=> number

type C = UnwrapBrand<PropertyKey & Brand>;
//=> PropertyKey

type D = UnwrapBrand<(1 | 200n | 'foo' | 'bar') & Brand>;
//=> 1 | 200n | 'foo' | 'bar'
```
*/
export type UnwrapBrand<T> = IfNotAnyOrNever<T, {
    ifNot: _UnwrapBrand<T, Primitive>;
}>;
type _UnwrapBrand<T, Base> = T extends Primitive ? T extends infer U & Pick<T, Exclude<keyof T, KeysOfUnion<Base>>> ? U : T : T;
