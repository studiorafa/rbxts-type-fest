/**
@see {@link Schema}
*/
export type SchemaOptions = {
    /**
    By default, this affects elements in array and tuple types. You can change this by passing `{recurseIntoArrays: false}` as the third type argument:
    - If `recurseIntoArrays` is set to `true` (default), array elements will be recursively processed as well.
    - If `recurseIntoArrays` is set to `false`, arrays will not be recursively processed, and the entire array will be replaced with the given value type.

    @example
    ```
    import type {Schema} from 'type-fest';

    type Participants = {
        attendees: string[];
        speakers: string[];
    };

    type ParticipantsWithMetadata = Schema<Participants, {id: number; name: string}, {recurseIntoArrays: true}>;
    //=> {
    // 	attendees: {
    // 		id: number;
    // 		name: string;
    // 	}[];
    // 	speakers: {
    // 		id: number;
    // 		name: string;
    // 	}[];
    // }

    type ParticipantsCount = Schema<Participants, number, {recurseIntoArrays: false}>;
    //=> {attendees: number; speakers: number}
    ```

    @default true
    */
    recurseIntoArrays?: boolean;
};
