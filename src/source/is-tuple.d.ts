/**
@see {@link IsTuple}
*/
export type IsTupleOptions = {
    /**
    Consider only fixed length arrays as tuples.

    - When set to `true` (default), arrays with rest elements (e.g., `[1, ...number[]]`) are _not_ considered as tuples.
    - When set to `false`, arrays with at least one non-rest element (e.g., `[1, ...number[]]`) are considered as tuples.

    @default true

    @example
    ```ts
    import type {IsTuple} from 'type-fest';

    type Example1 = IsTuple<[number, ...number[]], {fixedLengthOnly: true}>;
    //=> false

    type Example2 = IsTuple<[number, ...number[]], {fixedLengthOnly: false}>;
    //=> true
    ```
    */
    fixedLengthOnly?: boolean;
};
