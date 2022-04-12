import _ from "lodash";
import { IConstraint, IPatternEdge, IPatternNode } from "./graph";

export class MaximumSubgraph {

    nodes: IPatternNode[];
    // edges: IPatternEdge[];
    // constraints: IConstraint[];
    groups: Map<string, string[]>;
    nodeParent: Map<string, string>;
    constructor(
        nodes: IPatternNode[],
        // edges: IPatternEdge[],
        // constraints: IConstraint[],
    ) {
        this.nodes = nodes;
        // this.edges = edges;
        // this.constraints = constraints;

        this.groups = new Map<string, string[]>()
        this.nodeParent = new Map();
        nodes.forEach(n => {
            this.groups.set(n.id, [n.id])
            this.nodeParent.set(n.id, n.id)
        })
    }

    public union(parent: IPatternNode, child: IPatternNode) {
        const parentRoot = this.nodeParent.get(parent.id)!;
        const childRoot = this.nodeParent.get(child.id)!;

        if (parentRoot === childRoot) return;

        const parentGroup = this.groups.get(parentRoot) ?? [];
        const childGroup = this.groups.get(childRoot) ?? [];

        childGroup?.forEach(
            it => this.nodeParent.set(it, parentRoot)
        )
        this.groups.set(parentRoot, [...parentGroup, ...childGroup])
    }

    public SolvedNodes() {
        const groups = [...this.groups].map(it => it[1])
        const nodeDict = _.keyBy(this.nodes, it => it.id)
        return _.maxBy(groups, it => it.length)?.map(
            it => nodeDict[it]
        ) ?? []
    }

    public SolvedId() {
        const groups = [...this.groups].map(it => it[1])
        return _.maxBy(groups, it => it.length)
    }

}