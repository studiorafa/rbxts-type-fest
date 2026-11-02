/**
@see {@link PartialDeep}
*/
export type PartialDeepOptions = {
    /**
    Whether to affect the individual elements of arrays and tuples.

    @default false
    */
    readonly recurseIntoArrays?: boolean;
    /**
    Allows `undefined` values in non-tuple arrays.

    - When set to `true`, elements of non-tuple arrays can be `undefined`.
    - When set to `false`, only explicitly defined elements are allowed in non-tuple arrays, ensuring stricter type checking.

    @default false

    @example
    You can allow `undefined` values in non-tuple arrays by passing `{recurseIntoArrays: true; allowUndefinedInNonTupleArrays: true}` as the second type argument:

    ```
    import type {PartialDeep} from 'type-fest';

    type Settings = {
        languages: string[];
    };

    declare const partialSettings: PartialDeep<Settings, {recurseIntoArrays: true; allowUndefinedInNonTupleArrays: true}>;

    partialSettings.languages = [undefined]; // OK
    ```
    */
    readonly allowUndefinedInNonTupleArrays?: boolean;
};
