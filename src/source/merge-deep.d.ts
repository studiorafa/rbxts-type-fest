/**
Merge mode for array/tuple elements.
*/
type ArrayMergeMode = 'spread' | 'replace';
/**
MergeDeep options.

@see {@link MergeDeep}
*/
export type MergeDeepOptions = {
    /**
    Merge mode for array and tuple.

    When we walk through the properties of the objects and the same key is found and both are array or tuple, a merge mode must be chosen:
    - `replace`: Replaces the destination value by the source value. This is the default mode.
    - `spread`: Spreads the destination and the source values.

    See {@link MergeDeep} for usages and examples.

    Note: Top-level arrays and tuples are always spread.

    @default 'replace'
    */
    arrayMergeMode?: ArrayMergeMode;
    /**
    Whether to affect the individual elements of arrays and tuples.

    If this option is set to `true` the following rules are applied:
    - If the source does not contain the key, the value of the destination is returned.
    - If the source contains the key and the destination does not contain the key, the value of the source is returned.
    - If both contain the key, try to merge according to the chosen {@link MergeDeepOptions.arrayMergeMode arrayMergeMode} or return the source if unable to merge.

    @default false
    */
    recurseIntoArrays?: boolean;
};
