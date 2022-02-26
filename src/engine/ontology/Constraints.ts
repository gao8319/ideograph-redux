import { Primitive } from "d3";

export type PrimitiveTypeName = "string" | "number" | "boolean"

type PrimitiveTypePair<P extends PrimitiveTypeName> = {
    [K in P]: PrimitiveType<K>
}

export const primitiveTypeDefaultValue: PrimitiveTypePair<PrimitiveTypeName> = {
    "string": "",
    "number": 0,
    "boolean": true,
}

export const defaultPrimitive = <P extends PrimitiveTypeName>(p: P) => primitiveTypeDefaultValue[p]


export type PrimitiveType<T extends PrimitiveTypeName>
    = T extends "string"
    ? string
    : T extends "number"
    ? number
    : T extends "boolean"
    ? boolean
    : (string | number | boolean)

export enum BinaryOperator {
    Equals = '==',
    Less = '<',
    LessOrEquals = '<=',
    GreaterOrEquals = '>=',
    Greater = '>',
    NotEquals = '!=',
    Matches = '~='
}

export interface Constraint<T extends PrimitiveTypeName = PrimitiveTypeName> {
    // uuid: string;
    keyPath: string;
    type: T;
    operator: BinaryOperator;
    value: PrimitiveType<T>;
}