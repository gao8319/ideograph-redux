import { VisualElementType } from "../../engine/visual/VisualElement"
import { PrimitiveType } from "./data"
import { IPoint } from "./layout"
import { CommonModel } from "./model"
import { ComparisonOperator, Operator } from "./operator"

type NodeID = string
type EdgeID = string
type ConstraintID = string
// type DiagramID = string


export enum EdgeDirection {
    Specified = 0,
    Unspecified = 1,
}

export interface IPatternNode {
    id: NodeID,
    constraints: ConstraintID[],
    position: IPoint,

    classId: CommonModel.IClass['id'],
}

export interface IPatternEdge {
    id: EdgeID,
    from: NodeID,
    to: NodeID,
    direction: EdgeDirection,
    constraints: ConstraintID[],
}

export type IConstraint = {
    id: ConstraintID,
    expression: string,
    operator: ComparisonOperator,
    value: PrimitiveType,
    position?: IPoint,
    targetType: VisualElementType,
    targetId: string,
}



// export interface IPatternConstraint<T extends VisualElementType> extends IConstraint {

//     targetType: T,
//     targetId: T extends VisualElementType.Node ? NodeID
//     : T extends VisualElementType.Edge ? EdgeID
//     : never,

//     expression: string,
//     operator: ComparisonOperator,
//     value: PrimitiveType,

//     position: IPoint,
// }
