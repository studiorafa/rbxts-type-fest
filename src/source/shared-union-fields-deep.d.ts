/**
SharedUnionFieldsDeep options.

@see {@link SharedUnionFieldsDeep}
*/
export type SharedUnionFieldsDeepOptions = {
    /**
    When set to true, this option impacts each element within arrays or tuples. If all union values are arrays or tuples, it constructs an array of the shortest possible length, ensuring every element exists in the union array.

    @default false
    */
    recurseIntoArrays?: boolean;
};
