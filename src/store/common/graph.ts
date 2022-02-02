import { PrimitiveType } from "./data"
import { IPoint } from "./layout"
import { Operator } from "./operator"

type NodeID = string
type EdgeID = string
type ConstraintID = string
// type DiagramID = string


export enum EdgeDirection {
    Specified = 0,
    Unspecified = 1,
}

export enum ConstrainableElement {
    Node,
    Edge,
}

export interface IPatternNode {
    id: NodeID,
    constraints: ConstraintID[],
    position: IPoint,
}

export interface IPatternEdge {
    id: EdgeID,
    from: NodeID,
    to: NodeID,
    direction: EdgeDirection,
    constraints: ConstraintID[],
}

export interface IConstraint {
    id: ConstraintID,
    targetType: ConstrainableElement
}

export interface IPatternConstraint<T extends ConstrainableElement> extends IConstraint {

    targetType: T,
    targetId: T extends ConstrainableElement.Node ? NodeID
    : T extends ConstrainableElement.Edge ? EdgeID
    : never,

    expression: string,
    operator: Operator,
    value: PrimitiveType,

    position: IPoint,
}
