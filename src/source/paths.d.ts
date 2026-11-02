/**
Paths options.

@see {@link Paths}
*/
export type PathsOptions = {
    /**
    The maximum depth to recurse when searching for paths. Range: 0 ~ 10.

    @default 5
    */
    maxRecursionDepth?: number;
    /**
    Use bracket notation for array indices and numeric object keys.

    @default false

    @example
    ```
    import type {Paths} from 'type-fest';

    type ArrayExample = {
        array: ['foo'];
    };

    type A = Paths<ArrayExample, {bracketNotation: false}>;
    //=> 'array' | 'array.0'

    type B = Paths<ArrayExample, {bracketNotation: true}>;
    //=> 'array' | 'array[0]'
    ```

    @example
    ```
    import type {Paths} from 'type-fest';

    type NumberKeyExample = {
        1: ['foo'];
    };

    type A = Paths<NumberKeyExample, {bracketNotation: false}>;
    //=> 1 | '1' | '1.0'

    type B = Paths<NumberKeyExample, {bracketNotation: true}>;
    //=> '[1]' | '[1][0]'
    ```
    */
    bracketNotation?: boolean;
    /**
    Only include leaf paths in the output.

    @default false

    @example
    ```
    import type {Paths} from 'type-fest';

    type Post = {
        id: number;
        author: {
            id: number;
            name: {
                first: string;
                last: string;
            };
        };
    };

    type AllPaths = Paths<Post, {leavesOnly: false}>;
    //=> 'id' | 'author' | 'author.id' | 'author.name' | 'author.name.first' | 'author.name.last'

    type LeafPaths = Paths<Post, {leavesOnly: true}>;
    //=> 'id' | 'author.id' | 'author.name.first' | 'author.name.last'
    ```

    @example
    ```
    import type {Paths} from 'type-fest';

    type ArrayExample = {
        array: Array<{foo: string}>;
        tuple: [string, {bar: string}];
    };

    type AllPaths = Paths<ArrayExample, {leavesOnly: false}>;
    //=> 'array' | 'tuple' | `array.${number}` | `array.${number}.foo` | 'tuple.0' | 'tuple.1' | 'tuple.1.bar'

    type LeafPaths = Paths<ArrayExample, {leavesOnly: true}>;
    //=> `array.${number}.foo` | 'tuple.0' | 'tuple.1.bar'
    ```
    */
    leavesOnly?: boolean;
    /**
    Only include paths at the specified depth. By default all paths up to {@link PathsOptions.maxRecursionDepth | `maxRecursionDepth`} are included.

    Note: Depth starts at `0` for root properties.

    @default number

    @example
    ```
    import type {Paths} from 'type-fest';

    type Post = {
        id: number;
        author: {
            id: number;
            name: {
                first: string;
                last: string;
            };
        };
    };

    type DepthZero = Paths<Post, {depth: 0}>;
    //=> 'id' | 'author'

    type DepthOne = Paths<Post, {depth: 1}>;
    //=> 'author.id' | 'author.name'

    type DepthTwo = Paths<Post, {depth: 2}>;
    //=> 'author.name.first' | 'author.name.last'

    type LeavesAtDepthOne = Paths<Post, {leavesOnly: true; depth: 1}>;
    //=> 'author.id'
    ```
    */
    depth?: number;
};
