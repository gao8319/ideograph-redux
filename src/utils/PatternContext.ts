import { IConstraint, IPatternEdge, IPatternNode } from "./common/graph"
import { BinaryLogicOperator, UnaryLogicOperator } from "./common/operator"
import { DisjointSet } from "./common/disjoint";
import _ from "lodash";
import { CommonModel } from "./common/model";
import { VisualElementType } from "../engine/visual/VisualElement";


const MaybeUndefined = <T extends any>(value: T) => value as (T | undefined)

export interface ILogicOperator {
    type: (BinaryLogicOperator | UnaryLogicOperator);
    id: string;
}

export interface IConstraintContext {
    constraints: IConstraint[],
    logicOperators: ILogicOperator[],
    connections: {
        from: IConstraint['id'],
        to: IConstraint['id'],
    }[]
}

export interface IPatternContext {
    nodes: IPatternNode[];
    edges: IPatternEdge[];
    constraintContext: IConstraintContext;
}

interface ICorePatternContext {
    nodes: IPatternNode & { class: CommonModel.IClass }[];
    edges: IPatternEdge[];
    constraintContext: IConstraintContext;
}

export class IdeographPatternContext implements IPatternContext {

    public nodes: IPatternNode[];
    private nodeDict: Record<IPatternNode['id'], IPatternNode>;
    public edges: IPatternEdge[];
    public constraintContext: IConstraintContext;

    constructor(
        nodes: IPatternNode[],
        edges: IPatternEdge[],
        constraintContext: IConstraintContext,
    ) {
        this.nodes = nodes;
        this.edges = edges;
        this.constraintContext = constraintContext;
        this.nodeDict = _.keyBy(nodes, n => n.id);
    }

    public generateJSON = async () => {

    }

    public generateAskGraphAPI = async () => {

    }

    public generateCypherLang = async () => {

    }

    private findLargestConnectedNodes = async (emitWarnings = false) => {
        const disjointSet = new DisjointSet((n: IPatternNode) => n.id);
        disjointSet.makeSetByArray(this.nodes)

        this.edges.forEach(
            e => {
                const from = this.nodes.find(n => n.id === e.from);
                const to = this.nodes.find(n => n.id === e.to);
                from && to && disjointSet.union(from, to);
            }
        );

        const disjointParents = disjointSet.parents;

        const groupedEntries: Record<string, [string, IPatternNode][]> = _.groupBy(
            Object.entries(disjointParents),
            entry => entry[1].id
        );

        const [largestSubgraphParentId, largestSubgraphNodes] = _.maxBy(
            Object.entries(groupedEntries),
            ([_, v]) => v.length
        ) ?? [null, null];

        return largestSubgraphNodes?.map(it => it[1]);

    }

    public siftSubgraphByNodes = async (
        siftedNodes: IPatternNode[],
        emitWarnings = false,
    ): Promise<IPatternContext> => {
        const siftedNodeIds = this.nodes.map(n => n.id);
        const siftedEdges = this.edges.filter(
            e => siftedNodeIds.findIndex(nid => nid === e.from)
                && siftedNodeIds.findIndex(nid => nid === e.to)
        );

        const siftedEdgeIds = this.edges.map(e => e.id);


        const validConstraints = this.constraintContext.constraints.filter(
            constraint => {
                return (constraint.targetType === VisualElementType.Node && siftedNodeIds.includes(constraint.targetId))
                    || (constraint.targetType === VisualElementType.Edge && siftedEdgeIds.includes(constraint.targetId))
            }
        )

        const validConstraintDict = _.keyBy((validConstraints as CommonModel.IIdentifiable[]).concat(this.constraintContext.logicOperators), v => v.id);


        const constraintDisjointSet = new DisjointSet<CommonModel.IdType>(obj => obj.id);
        constraintDisjointSet.makeSetByArray(validConstraints);
        constraintDisjointSet.makeSetByArray(this.constraintContext.logicOperators);

        this.constraintContext.connections.forEach(
            c => { constraintDisjointSet.union(validConstraintDict[c.to], validConstraintDict[c.from]) }
        )

        const treeRoots = Object.keys(constraintDisjointSet.trees)


        console.log("Forest root num:", treeRoots.length);


        const toFromDict = _.groupBy((this.constraintContext.connections), conn => conn.to)

        // TODO: Bind boolean value to the node
        const isFilledNode = <T extends IConstraint | ILogicOperator>(root: T): boolean => {
            if ((root as IConstraint).targetId) {
                if (siftedNodeIds.includes((root as IConstraint).targetId))
                    return true;
                return false;
            } else {
                const fromWhich = MaybeUndefined(toFromDict[(root as ILogicOperator).id])
                if ((root as ILogicOperator).type === UnaryLogicOperator.Not) {
                    if (fromWhich?.length === 1) {
                        return isFilledNode(validConstraintDict[(fromWhich[0].from)] as any);
                    }
                    return false;
                } else {
                    if (fromWhich?.length === 2) {
                        return isFilledNode(validConstraintDict[(fromWhich[0].from)] as any)
                            && isFilledNode(validConstraintDict[(fromWhich[1].from)] as any);
                    }
                    return false;
                }
            }
            return false;
        }

        const treeRootValidations = treeRoots.map(t => isFilledNode(validConstraintDict[t] as any));

        console.log(treeRootValidations);




        const validConstraintIds = validConstraints.map(sc => sc.id);

        const fromToDict = {

        }




        const siftedOperators = this.constraintContext.logicOperators.filter(
            so => {
                return
            }
        )

        const siftedConstraintConnections = this.constraintContext.connections.filter(
            cc => {
                return validConstraintIds.includes(cc.from) && (
                    validConstraintIds.includes(cc.to)
                )
            }
        )
        return {
            nodes: siftedNodes,
            edges: siftedEdges,
            constraintContext: {
                constraints: [],
                connections: [],
                logicOperators: []
            }
        }
    }

    public findLargestConnectedContext = async (emitWarnings = false) => {
        const connectedNodes = await this.findLargestConnectedNodes();
        if (connectedNodes) {
            return await this.siftSubgraphByNodes(connectedNodes);
        }
        else {
            return null;
        }
    }
}
