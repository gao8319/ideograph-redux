
export enum ComparisonOperator {
    Equal,
    Less,
    Greater,
    LessOrEqual,
    GreaterOrEqual,
    NotEqual,
    MatchRegex,
}

export const literal2ComparisonOperator: Record<string, ComparisonOperator|undefined> = {
    "==": ComparisonOperator.Equal,
    "<": ComparisonOperator.Less,
    ">": ComparisonOperator.Greater,
    "<=": ComparisonOperator.LessOrEqual,
    ">=": ComparisonOperator.GreaterOrEqual,
    "!=": ComparisonOperator.NotEqual,
    "~=": ComparisonOperator.MatchRegex,
}

export const comparisonOperator2Literal: Record<ComparisonOperator, string|undefined> = {
    [ComparisonOperator.Equal]: "==",
    [ComparisonOperator.Less]: "<",
    [ComparisonOperator.Greater]: ">",
    [ComparisonOperator.LessOrEqual]: "<=",
    [ComparisonOperator.GreaterOrEqual]: ">=",
    [ComparisonOperator.NotEqual]: "!=",
    [ComparisonOperator.MatchRegex]: "~=",
}

export enum BinaryLogicOperator {
    And = 0x10,
    Or = 0x11,
}

export enum UnaryLogicOperator {
    Not = 0x12
}

export type LogicOperator = UnaryLogicOperator | BinaryLogicOperator
export type Operator = ComparisonOperator | LogicOperator