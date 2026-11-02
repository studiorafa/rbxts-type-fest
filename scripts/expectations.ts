// Independent examples of the promised behavior, never derived from generated declarations.
export function semantics(names: Set<string>): string {
	const tests: Record<string, string[]> = {
		Merge: [
			"Expect<Equal<Merge<{a:string},{a:number}>,{a:number}>>",
			"Expect<Equal<Merge<{readonly a:string;b?:number},{c:boolean}>,{readonly a:string;b?:number;c:boolean}>>",
		],
		Except: ['Expect<Equal<Except<{a:string;b:number},"a">,{b:number}>>'],
		ValueOf: ["Expect<Equal<ValueOf<{a:string;b:number}>,string|number>>"],
		SetOptional: [
			'Expect<Equal<SetOptional<{a:string;b:number},"a">,{a?:string;b:number}>>',
			'Expect<Equal<Assignable<{a:undefined;b:number},SetOptional<{a:string;b:number},"a">>,false>>',
		],
		SetReadonly: ['Expect<Equal<SetReadonly<{a:string;b:number},"a">,{readonly a:string;b:number}>>'],
		Writable: ["Expect<Equal<Writable<{readonly a:string}>,{a:string}>>"],
		ReadonlyKeysOf: ['Expect<Equal<ReadonlyKeysOf<{readonly a:string;b:number}>,"a">>'],
		OptionalKeysOf: ['Expect<Equal<OptionalKeysOf<{a?:string;b:number}>,"a">>'],
		UnknownRecord: [
			"Expect<Equal<keyof UnknownRecord,keyof any>>",
			"Expect<Equal<Assignable<{a:string;0:number},UnknownRecord>,true>>",
		],
		UnionToIntersection: [
			"Expect<Equal<UnionToIntersection<{a:string}|{b:number}>,{a:string}&{b:number}>>",
		],
		DistributedPick: [
			'Expect<Equal<DistributedPick<{kind:"a";a:1}|{kind:"b";b:2},"kind">,{kind:"a"}|{kind:"b"}>>',
		],
		ArrayElement: ["Expect<Equal<ArrayElement<readonly [1,2]>,1|2>>"],
		ArrayReverse: [
			"Expect<Equal<ArrayReverse<[1,2,3]>,[3,2,1]>>",
			"Expect<Equal<ArrayReverse<readonly [1,2]>,readonly [2,1]>>",
			"Expect<Equal<ArrayReverse<string[]>,string[]>>",
		],
		TupleToUnion: ["Expect<Equal<TupleToUnion<[1,2]>,1|2>>"],
		Entry: [
			'Expect<Equal<Entry<{a:1}>,["a",1]>>',
			"Expect<Equal<Entry<Map<string,number>>,[string,number]>>",
			"Expect<Equal<Entry<Set<string>>,[string,string]>>",
		],
		Entries: ["Expect<Equal<Entries<Map<string,number>>,Array<[string,number]>>>"],
		RequireAllOrNone: [
			"Expect<Equal<Assignable<{a:string;b:number},RequireAllOrNone<{a:string;b:number}>>,true>>",
			"Expect<Equal<Assignable<{},RequireAllOrNone<{a:string;b:number}>>,true>>",
			"Expect<Equal<Assignable<{a:string},RequireAllOrNone<{a:string;b:number}>>,false>>",
		],
		RequireOneOrNone: [
			"Expect<Equal<Assignable<{a:string},RequireOneOrNone<{a:string;b:number}>>,true>>",
			"Expect<Equal<Assignable<{},RequireOneOrNone<{a:string;b:number}>>,true>>",
			"Expect<Equal<Assignable<{a:string;b:number},RequireOneOrNone<{a:string;b:number}>>,false>>",
		],
		Tagged: [
			'Expect<Equal<Tagged<number,"money",{currency:"USD"}>[typeof ExternalTag],{money:{currency:"USD"}}>>',
			'Expect<Equal<Assignable<number,Tagged<number,"money">>,false>>',
			'Expect<Equal<Assignable<Tagged<number,"money">,Tagged<number,"account">>,false>>',
			"Expect<Equal<Assignable<Tagged<number,1>,number>,true>>",
			"Expect<Equal<Assignable<Tagged<number,typeof ExternalTag>,number>,true>>",
		],
		GetTagMetadata: [
			'Expect<Equal<GetTagMetadata<Branded<number,"money",{currency:"USD"}>,"money">,{currency:"USD"}>>',
		],
		UnwrapTagged: ['Expect<Equal<UnwrapTagged<Branded<{price:number},"money">>,{price:number}>>'],
		UnwrapOpaque: ['Expect<Equal<UnwrapOpaque<Branded<{price:number},"money">>,{price:number}>>'],
		CamelCase: ['Expect<Equal<CamelCase<"hello_world">,"helloWorld">>'],
		IsEqual: ["Expect<Equal<IsEqual<1,2>,false>>", "Expect<Equal<IsEqual<{a:1},{a:1}>,true>>"],
	};
	const tagged = ["Tagged", "GetTagMetadata", "UnwrapTagged", "UnwrapOpaque"].some((name) =>
		names.has(name),
	);
	return (
		(tagged
			? 'import type ExternalTag from "tagged-tag";\ntype Branded<T,N extends keyof any,M=never> = T & {readonly [ExternalTag]:{[K in N]:M}};\n'
			: "") +
		"type Equal<A,B> = (<T>()=>T extends A?1:2) extends (<T>()=>T extends B?1:2)?true:false;\ntype Expect<T extends true> = T;\ntype Assignable<A,B> = [A] extends [B]?true:false;\n" +
		Object.entries(tests)
			.filter(([name]) => names.has(name))
			.flatMap(([name, checks]) =>
				checks.map((check, index) => `type Test${name}__${index} = ${check};`),
			)
			.join("\n")
	);
}
