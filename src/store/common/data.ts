export enum PrimitiveTypeName {
    String = 'string',
    Number = 'number',
    Boolean = 'boolean',
}

export type PrimitiveType<N extends PrimitiveTypeName = PrimitiveTypeName>
    = N extends 'string' ? string
    : N extends 'number' ? number
    : N extends 'boolean' ? boolean
    : never