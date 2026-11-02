import type {Trim} from "../trim.d.ts";
/**
Return a string representation of the given string or number.

Note: This type is not the return type of the `.toString()` function.
*/
export type ToString<T> = T extends string | number ? `${T}` : never;
/**
Returns a boolean for whether the given string `S` starts with the given string `SearchString`.

@example
```
type A = StartsWith<'abcde', 'abc'>;
//=> true

type B = StartsWith<'abcde', 'bc'>;
//=> false

type C = StartsWith<string, 'bc'>;
//=> never

type D = StartsWith<'abcde', string>;
//=> never
```

@category String
@category Template literal
*/
export type StartsWith<S extends string, SearchString extends string> = string extends S | SearchString ? never : S extends `${SearchString}${infer T}` ? true : false;
/**
Returns a boolean for whether the string is numeric.

This type is a workaround for [Microsoft/TypeScript#46109](https://github.com/microsoft/TypeScript/issues/46109#issuecomment-930307987).
*/
export type IsNumeric<T extends string> = T extends `${number}` ? Trim<T> extends T ? true : false : false;
