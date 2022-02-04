
export enum ComparisonOperator {
    Equal,
    Less,
    Greater,
    LessOrEqual,
    GreaterOrEqual,
    NotEqual,
    MatchRegex,
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