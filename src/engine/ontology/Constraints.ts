import { Primitive } from "d3";

export type PrimitiveTypeName = "string" | "number" | "boolean"

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