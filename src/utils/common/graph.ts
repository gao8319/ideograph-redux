import { VisualElementType } from "../../engine/visual/VisualElement"
import { PrimitiveType } from "./data"
import { IPoint } from "./layout"
import { CommonModel } from "./model"
import { ComparisonOperator, Operator } from "./operator"

/**
 * 基本数据类
 */

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
    alias?: string,
    class: CommonModel.IColoredClass,
}

export interface IPatternEdge {
    id: EdgeID,
    from: NodeID,
    to: NodeID,
    direction: EdgeDirection,
    constraints: ConstraintID[],
    class: CommonModel.IEdgeClass
}

export type IConstraint = {
    id: ConstraintID,
    position?: IPoint,
    targetType: VisualElementType,
    targetId: string,

    expression?: string,
    property?: CommonModel.IProperty,
    operator?: ComparisonOperator,
    value?: PrimitiveType,
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
