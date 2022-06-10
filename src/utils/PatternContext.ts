import { IConstraint, IPatternEdge, IPatternNode } from "./common/graph"
import { BinaryLogicOperator, ComparisonOperator, UnaryLogicOperator } from "./common/operator"
import { DisjointSet } from "./common/disjoint";
import _ from "lodash";
import { CommonModel } from "./common/model";
import { VisualElementType } from "../engine/visual/VisualElement";
import { IdeographIR } from "./IR";
import { Solution } from "../services/PatternSolution";
import { ElementType } from "@fluentui/react";
import { DisjointSubgraph, MaximumSubgraph } from "./common/maximumSubgraph";
import { PatternGraphEngine } from "../engine/PatternGraphEngine";


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

/**
 * 可以接受 Aggregate 的 PatternContext
 * 用于将编辑 直接产生的数据结构 转换成 后端接受的数据结构
 */
export class IdeographAggregatePatternContext {

    private structureContext: ReturnType<PatternGraphEngine["generatePatternGraphContext"]>;
    private constriantContext: IConstraintContext;

    constructor(
        structureContext: ReturnType<PatternGraphEngine["generatePatternGraphContext"]>,
        constraintContext: IConstraintContext
    ) {
        this.structureContext = structureContext;
        this.constriantContext = constraintContext;
    }

    public async buildCoreContext(): Promise<Solution.Pattern> {

        const aggregateContainedElements = Object.values(this.structureContext.groups).map(it => it.getContainedElements());
        const allNodes = Object.values(this.structureContext.nodes).concat(aggregateContainedElements.flatMap(it => it.nodes))
        const allEdges = Object.values(this.structureContext.edges).concat(aggregateContainedElements.flatMap(it => it.edges))
        const subgraph = new DisjointSubgraph(allNodes);
        allEdges.forEach(e => {
            subgraph.union(e);
        })
        const filteredNodes = subgraph.SolvedNodes();
        const filteredEdges = allEdges.filter(e => filteredNodes.includes(e.from) || filteredNodes.includes(e.to))

        const coreGraph = {
            nodes: filteredNodes,
            edges: filteredEdges,
            aggregations: aggregateContainedElements.map(it => {
                return {
                    nodes: it.nodes.map(n => n.uuid),
                    edges: it.edges.map(e => e.uuid),
                    multiplier: it.multiplier,
                }
            })
        }

        const allNodeIds = coreGraph.nodes.map(it => it.uuid);
        const allEdgeIds = coreGraph.edges.map(it => it.uuid)

        const validConstraints = this.constriantContext.constraints.filter(
            constraint => {
                return (constraint.targetType === VisualElementType.Node && allNodeIds.includes(constraint.targetId))
                    || (constraint.targetType === VisualElementType.Edge && allEdgeIds.includes(constraint.targetId))
            }
        )

        return {
            nodes: coreGraph.nodes.map(n => ({
                patternId: n.uuid,
                type: n.ontologyClass.name
            })),
            edges: coreGraph.edges.map(e => ({
                patternId: e.uuid,
                fromPatternId: e.from.uuid,
                toPatternId: e.to.uuid,
                type: e.name ?? `${e.from.ontologyClass.id}-->${e.to.ontologyClass.id}`
            })),
            constraints: validConstraints.map(c => ({
                patternId: c.id,
                targetType: c.targetType === VisualElementType.Node ? "Node" : "Edge",
                targetPatternId: c.targetId,
                property: c.property?.name!,
                operator: c.operator === ComparisonOperator.Equal ? "Equal"
                    : c.operator === ComparisonOperator.Less ? "Less"
                        : c.operator === ComparisonOperator.Greater ? "Greater"
                            : c.operator === ComparisonOperator.LessOrEqual ? "LessOrEqual"
                                : c.operator === ComparisonOperator.GreaterOrEqual ? "GreaterOrEqual"
                                    : c.operator === ComparisonOperator.NotEqual ? "NotEqual"
                                        : c.operator === ComparisonOperator.MatchRegex ? "MatchRegex"
                                            : "MatchRegex",
                value: String(c.value)
            })),
            aggregations: coreGraph.aggregations
        }
    }
}

/**
 * 用于将编辑 直接产生的数据结构 转换成 后端接受的数据结构，
 * 不接受 Aggregate
 */
export class IdeographPatternContext implements IPatternContext {

    public nodes: IPatternNode[];
    private nodeHashMap: Record<IPatternNode['id'], IPatternNode>;
    public edges: IPatternEdge[];
    public constraintContext: IConstraintContext;

    protected _maxSubgraphNodes?: IPatternNode[];
    protected _maxSubgraphNodeHashMap?: Record<IPatternNode['id'], IPatternNode>;
    public get maxSubgraphNodeCount() { return this._maxSubgraphNodes?.length; }

    protected _maxSubgraphEdges?: IPatternEdge[];
    protected _maxSubgraphEdgeHashMap?: Record<IPatternEdge['id'], IPatternEdge>;
    // protected _maxSubgraphNodeFromGroupMap?: Record<IPatternEdge['from'], IPatternEdge>;
    // protected _maxSubgraphNodeToGroupMap?: Record<IPatternEdge['from'], IPatternEdge>;
    public get maxSubgraphEdgeCount() { return this._maxSubgraphEdges?.length; }


    protected _maxSubgraphConstraints?: IConstraint[];
    public get maxSubgraphConstraintCount() { return this._maxSubgraphConstraints?.length; }
    protected _maxSubgraphConstraintTreeRootIds?: IConstraint['id'][];
    public get maxSubgraphConstraintTreeCount() { return this._maxSubgraphConstraintTreeRootIds?.length }

    protected _ir?: IdeographIR.IRepresentation;
    public get ir() { return this._ir }

    constructor(
        nodes: IPatternNode[],
        edges: IPatternEdge[],
        constraintContext: IConstraintContext,
    ) {
        this.nodes = nodes;
        this.edges = edges;
        this.constraintContext = constraintContext;
        // debugger
        this.nodeHashMap = _.keyBy(nodes, n => n.id);
    }

    public generateJSON = async () => {

    }

    public generateAskGraphAPI = async () => {

    }

    public generateCypherLang = async () => {

    }

    private findLargestConnectedNodes = async (emitWarnings = false) => {

        const subgraph = new MaximumSubgraph(this.nodes)



        // const disjointSet = new DisjointSet((n: IPatternNode) => n.id);
        // disjointSet.makeSetByArray(this.nodes)

        // debugger
        this.edges.forEach(
            e => {
                const from = this.nodeHashMap[e.from];
                const to = this.nodeHashMap[e.to];
                from && to && subgraph.union(to, from);
            }
        );

        // const selectedRoot = _.maxBy(Object.entries(disjointSet.trees), i => i[1]);

        // if (!selectedRoot) return [];

        // const selectedRootId = selectedRoot[0];

        // const disjointParents = disjointSet.parents;

        // const groupedEntries: Record<string, [string, IPatternNode][]> = _.groupBy(
        //     Object.entries(disjointParents),
        //     entry => entry[1].id
        // );

        // const [largestSubgraphParentId, largestSubgraphNodes] = _.maxBy(
        //     Object.entries(groupedEntries),
        //     ([_, v]) => v.length
        // ) ?? [null, null];


        const largestSubgraphNodeIds = subgraph.SolvedId()

        // console.log(largestSubgraphNodeIds);

        // console.log(largestSubgraphNodeIds?.map(it => this.nodeHashMap[it]))
        this._maxSubgraphNodes = largestSubgraphNodeIds?.map(it => this.nodeHashMap[it]);
        this._maxSubgraphNodeHashMap = _.keyBy(this._maxSubgraphNodes, n => n.id)
        this._maxSubgraphEdges = this.edges.filter(
            e => (this._maxSubgraphNodeHashMap?.[e.from] !== undefined)
                && (this._maxSubgraphNodeHashMap?.[e.to] !== undefined)
        );
        return this._maxSubgraphNodes;
    }


    public generatePrunnedPattern = async (): Promise<Solution.Pattern> => {
        await this.findLargestConnectedNodes();
        // debugger
        const validConstraints = this.constraintContext.constraints.filter(
            constraint => {
                return (constraint.targetType === VisualElementType.Node && this._maxSubgraphNodeHashMap?.[constraint.targetId])
                    || (constraint.targetType === VisualElementType.Edge && this._maxSubgraphEdgeHashMap?.[constraint.targetId])
            }
        )
        this._maxSubgraphConstraints = validConstraints;

        // debugger    
        return {
            nodes: this._maxSubgraphNodes!.map(n => ({
                patternId: n.id,
                type: n.class.name
            })),
            edges: this._maxSubgraphEdges!.map(e => ({
                patternId: e.id,
                fromPatternId: e.from,
                toPatternId: e.to,
                type: e.class.name,
            })),
            constraints: this._maxSubgraphConstraints.map(c => ({
                patternId: c.id,
                targetType: c.targetType === VisualElementType.Node ? "Node" : "Edge",
                targetPatternId: c.targetId,
                property: c.property?.name!,
                operator: c.operator === ComparisonOperator.Equal ? "Equal"
                    : c.operator === ComparisonOperator.Less ? "Less"
                        : c.operator === ComparisonOperator.Greater ? "Greater"
                            : c.operator === ComparisonOperator.LessOrEqual ? "LessOrEqual"
                                : c.operator === ComparisonOperator.GreaterOrEqual ? "GreaterOrEqual"
                                    : c.operator === ComparisonOperator.NotEqual ? "NotEqual"
                                        : c.operator === ComparisonOperator.MatchRegex ? "MatchRegex"
                                            : "MatchRegex",
                value: String(c.value)
            }))
        }
    }

    public getIrBySiftedNodes = async (
        siftedNodes: IPatternNode[],
        emitWarnings = false,
    ): Promise<IdeographIR.IRepresentation> => {

        const siftedNodeIds = siftedNodes.map(n => n.id);
        const siftedEdges = this._maxSubgraphEdges;

        const siftedEdgeIds = this.edges.map(e => e.id);

        // Prepare for hash lookup
        const siftedEdgeFromDicts = _.groupBy(siftedEdges, e => e.from);
        const siftedEdgeToDicts = _.groupBy(siftedEdges, e => e.to);

        const flagSiftedEdgesPushed = Object.fromEntries(siftedEdgeIds.map(id => [id, false]))
        const flagSiftedNodesPushed = Object.fromEntries(siftedNodeIds.map(id => [id, false]))


        const getIrNodeById = (id: string): IdeographIR.INode => {
            const targetType = this.nodeHashMap[id].class.name
            return {
                alias: id,
                type: targetType
            }
        }

        const tryPushNextToPath = (irPath: IdeographIR.IPath): boolean => {

            const lastNode = irPath.nodes[irPath.nodes.length - 1];

            const fromCandidates = siftedEdgeFromDicts[lastNode.alias];
            if (fromCandidates) {
                const fromCandidate = fromCandidates.find(c => !flagSiftedEdgesPushed[c.id]);
                if (fromCandidate) {
                    const newIrNode = getIrNodeById(fromCandidate.to);
                    flagSiftedEdgesPushed[fromCandidate.id] = true;
                    flagSiftedNodesPushed[fromCandidate.to] = true;
                    irPath.nodes.push(newIrNode);
                    irPath.directionToNext.push(IdeographIR.Direction.Default);
                    return true;
                }
            }

            const toCandidates = siftedEdgeToDicts[lastNode.alias];
            if (toCandidates) {
                const toCandidate = toCandidates.find(c => !flagSiftedEdgesPushed[c.id]);
                if (toCandidate) {
                    const newIrNode = getIrNodeById(toCandidate.from);
                    flagSiftedEdgesPushed[toCandidate.id] = true;
                    flagSiftedNodesPushed[toCandidate.from] = true;
                    irPath.nodes.push(newIrNode);
                    irPath.directionToNext.push(IdeographIR.Direction.Reversed);
                    return true;
                }
            }

            return false;

        }

        // returns true if need to continue;
        const makeIrPath = (): IdeographIR.IPath | null => {

            const irPath: IdeographIR.IPath = {
                nodes: [],
                directionToNext: [],
            }

            const firstNodeId = siftedNodeIds.find(n => !flagSiftedNodesPushed[n]);
            if (firstNodeId) {
                irPath.nodes.push(getIrNodeById(firstNodeId));
                flagSiftedNodesPushed[firstNodeId] = true;
                while (true) {
                    if (!tryPushNextToPath(irPath))
                        break;
                };
                return irPath;
            }
            return null;
        }


        const allIrPath = [];
        while (true) {
            const newIrPath = makeIrPath();
            if (!newIrPath) break;
            allIrPath.push(newIrPath);
        }

        const ir: IdeographIR.IRepresentation = {
            propertyConstraint: null,
            structureConstraint: {
                paths: allIrPath,
            }
        }
        this._ir = ir;


        /****************************************
         *           Sift constraints           *
         ****************************************/

        const validConstraints = this.constraintContext.constraints.filter(
            constraint => {
                return (constraint.targetType === VisualElementType.Node && siftedNodeIds.includes(constraint.targetId))
                    || (constraint.targetType === VisualElementType.Edge && siftedEdgeIds.includes(constraint.targetId))
            }
        )
        this._maxSubgraphConstraints = validConstraints;

        const validConstraintDict = _.keyBy((validConstraints as CommonModel.IIdentifiable[]).concat(this.constraintContext.logicOperators), v => v.id);


        const constraintDisjointSet = new DisjointSet<CommonModel.IdType>(obj => obj.id);
        constraintDisjointSet.makeSetByArray(validConstraints);
        constraintDisjointSet.makeSetByArray(this.constraintContext.logicOperators);

        this.constraintContext.connections.forEach(
            c => { constraintDisjointSet.union(validConstraintDict[c.to], validConstraintDict[c.from]) }
        )

        const treeRoots = Object.keys(constraintDisjointSet.trees)


        // console.log("Forest root num:", treeRoots.length);


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
        }


        // TODO: Bind boolean value to the node
        const traverseForIrProps = <T extends IConstraint | ILogicOperator>(root: T): IdeographIR.IPropertyConstraint | null => {
            if ((root as IConstraint).targetId) {
                if (siftedNodeIds.includes((root as IConstraint).targetId))
                    return root as IConstraint;
                return null;
            } else {
                const fromWhich = MaybeUndefined(toFromDict[(root as ILogicOperator).id])
                if ((root as ILogicOperator).type === UnaryLogicOperator.Not) {
                    if (fromWhich?.length === 1) {
                        const child = traverseForIrProps(validConstraintDict[(fromWhich[0].from)] as any);
                        if (child === null) {
                            return null;
                        }
                        else {
                            return {
                                logicType: UnaryLogicOperator.Not,
                                subClause: [child]
                            }
                        }
                    }
                    return null;
                } else {
                    if (fromWhich?.length === 2) {
                        const child1 = traverseForIrProps(validConstraintDict[(fromWhich[0].from)] as any);
                        const child2 = traverseForIrProps(validConstraintDict[(fromWhich[1].from)] as any);
                        if (child1 === null || child2 === null) {
                            return null;
                        }
                        else {
                            return {
                                logicType: (root as ILogicOperator).type,
                                subClause: [child1, child2]
                            }
                        }
                    }
                    return null;
                }
            }
        }

        this._maxSubgraphConstraintTreeRootIds = treeRoots.filter(t => isFilledNode(validConstraintDict[t] as any));

        const irProps = treeRoots.map(t => traverseForIrProps(validConstraintDict[t] as any)!).filter(it => it !== null);

        if (irProps.length > 1) {
            ir.propertyConstraint = {
                logicType: BinaryLogicOperator.And,
                subClause: irProps
            }
        }
        else if (irProps.length === 1) {
            ir.propertyConstraint = irProps[0];
        }
        return ir;
    }

    public findLargestConnectedContext = async (emitWarnings = false) => {
        const connectedNodes = await this.findLargestConnectedNodes();
        if (connectedNodes) {
            return await this.getIrBySiftedNodes(connectedNodes);
        }
        else {
            return null;
        }
    }
}
