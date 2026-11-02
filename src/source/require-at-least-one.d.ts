import type {IfNotAnyOrNever} from "./internal/type.d.ts";
import type {If} from "./if.d.ts";
import type {IsNever} from "./is-never.d.ts";
import type {IsAny} from "./is-any.d.ts";
import type {Except} from "./except.d.ts";
/**
Create a type that requires at least one of the given keys, while keeping the remaining keys as is.

@example
```
import type {RequireAtLeastOne} from 'type-fest';

type Responder = {
    text?: () => string;
    json?: () => string;
    secure?: boolean;
};

const responder: RequireAtLeastOne<Responder, 'text' | 'json'> = {
    json: () => '{"message": "ok"}',
    secure: true,
};
```

@category Object
*/
export type RequireAtLeastOne<ObjectType, KeysType extends keyof ObjectType = keyof ObjectType> = IfNotAnyOrNever<ObjectType, {
    ifNot: If<IsNever<KeysType>, never, _RequireAtLeastOne<ObjectType, If<IsAny<KeysType>, keyof ObjectType, KeysType>>>;
}>;
type _RequireAtLeastOne<ObjectType, KeysType extends keyof ObjectType> = {
    [Key in KeysType]-?: Required<Pick<ObjectType, Key>> // 1. Make `Key`'s type required
     & Partial<Pick<ObjectType, Exclude<KeysType, Key>>>;
}[KeysType] & Except<ObjectType, KeysType>; // 3. Add the remaining keys not in `KeysType`

