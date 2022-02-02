// import { createSlice, PayloadAction } from '@reduxjs/toolkit'
// import { IPoint } from './common/layout'
// import type { RootState } from './store'

// type NodeID = string
// type EdgeID = string
// type ConstraintID = string
// type DiagramID = string

// export enum BinaryLogicOperator {
//     And = 0,
//     Or = 1,
// }

// export enum UnaryLogicOperator {
//     Not = 3
// }

// export type LogicOperator = UnaryLogicOperator | BinaryLogicOperator

// export enum PrimitiveTypeName {
//     String = 'string',
//     Number = 'number',
//     Boolean = 'boolean',

// }

// export type PrimitiveType<N extends PrimitiveTypeName = PrimitiveTypeName>
//     = N extends 'string' ? string
//     : N extends 'number' ? number
//     : N extends 'boolean' ? boolean
//     : never


// export enum EdgeDirection {
//     Specified = 0,
//     Unspecified = 1,
// }

// export enum Operator {
//     Equal,
//     Less,
//     Greater,
//     LessOrEqual,
//     GreaterOrEqual,
//     NotEqual,
//     MatchRegex,
// }

// interface IConstrainable<T extends NodeID | EdgeID> {
//     id: T
// }



// interface IPatternNode extends IConstrainable<NodeID> {
//     id: NodeID,
//     constraints: IPatternConstraint<IPatternNode>['id'][],
//     position: IPoint,
// }

// export enum ConstrainableElement {
//     Node,
//     Edge,
// }

// interface IPatternEdge extends IConstrainable<EdgeID> {
//     id: EdgeID,
//     from: NodeID,
//     to: NodeID,
//     direction: EdgeDirection,
//     constraints: IPatternConstraint<IPatternEdge>['id'][],
// }


// interface IDiagrammable {
//     diagramID: DiagramID
// }

// interface IPatternConstraint
//     <T extends IConstrainable<NodeID | EdgeID> = (IPatternNode | IPatternEdge)>
//     extends IDiagrammable {

//     id: ConstraintID,

//     targetId: T extends IConstrainable<infer E> ? E : never,
//     targetType: T extends IConstrainable<infer E> ? (
//         E extends NodeID
//         ? ConstrainableElement.Node
//         : E extends EdgeID
//         ? ConstrainableElement.Edge
//         : never
//     ) : never,

//     expression: string,
//     operator: Operator,
//     value: PrimitiveType,

//     position: IPoint,
//     diagramID: DiagramID,
// }

// interface IConstraintDiagramNode<T extends LogicOperator = LogicOperator> extends IDiagrammable {
//     logic: T,

//     in: T extends BinaryLogicOperator
//     ? [DiagramID, DiagramID]
//     : T extends UnaryLogicOperator
//     ? [DiagramID]
//     : never,

//     out: DiagramID,

//     id: DiagramID,

//     position: IPoint,

// }

// interface IConstraintDiagramLink extends IDiagrammable {
//     diagramId: DiagramID,
//     from: DiagramID,
//     to: DiagramID,
// }



// // Define a type for the slice state
// interface GraphState {
//     nodes: IPatternNode[],
//     edges: IPatternEdge[],

//     nodeConstraints: IPatternConstraint<IPatternNode>[],
//     edgeConstraints: IPatternConstraint<IPatternEdge>[],

//     diagramLogicNodes: IConstraintDiagramNode[],
//     diagramLinks: IConstraintDiagramLink[]
// }

// // Define the initial state using that type
// const initialState: GraphState = {
//     nodes: [],
//     edges: [],
//     nodeConstraints: [],
//     edgeConstraints: [],
//     diagramLinks: [],
//     diagramLogicNodes: [],
// }

// export const graphSlice = createSlice({
//     name: 'graph',
//     // `createSlice` will infer the state type from the `initialState` argument
//     initialState,
//     reducers: {
//         addNode(state, action: PayloadAction<IPatternNode>) {
//             state.nodes.push(action.payload)
//         },
//         addEdge(state, action: PayloadAction<IPatternEdge>) {
//             state.edges.push(action.payload)
//         },
//         addConstraint(state, action: PayloadAction<IPatternConstraint<IPatternEdge> | IPatternConstraint<IPatternNode>>) {
//             const constraint = action.payload
//             if (constraint.targetType === ConstrainableElement.Node) {
//                 state.nodeConstraints.push(constraint);
//                 state.nodes.find(it => it.id === constraint.targetId)?.constraints.push(constraint.id);
//             }
//             else if (constraint.targetType === ConstrainableElement.Edge) {
//                 state.edgeConstraints.push(constraint);
//                 state.edges.find(it => it.id === constraint.targetId)?.constraints.push(constraint.id);
//             }
//         }
//     },
// })

// export const { addNode, addEdge, addConstraint } = graphSlice.actions

// // export const selectNodes = (state: RootState) => state.graph.nodes
// // export const selectEdges = (state: RootState) => state.graph.edges
// // export const selectNodeConstraints = (state: RootState) => state.graph.nodeConstraints
// // export const selectEdgeConstraints = (state: RootState) => state.graph.edgeConstraints

// export default graphSlice.reducer

export {}