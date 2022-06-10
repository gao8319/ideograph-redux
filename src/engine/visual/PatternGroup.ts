import { PatternEdge } from "./PatternEdge";
import { PatternNode } from "./PatternNode";
import { IFocusableElement, VisualElementType } from "./VisualElement";

import './PatternGroup.css'
import Color from "color";
import { Arrow } from "../elements/Arrow";
import { addVector, IPoint } from "../../utils/common/layout";

type GroupableElements = Set<PatternNode | PatternEdge>;

const delta: IPoint = { x: -24, y: +0 };
const delta2: IPoint = { x: -12, y: +0 };

interface RenderElements {
    root: D3<SVGGElement>;
    nodeShadows: D3<SVGGElement>;
    edgeShadows: D3<SVGGElement>;
    mouse: D3<SVGPathElement>;
}

/**
 * 多个元素构成的子图群组，对应着查询里的 Aggregation
 */
export class PatternGroup implements IFocusableElement<VisualElementType.Group>  {
    public readonly elementType = VisualElementType.Group;

    public readonly uuid: string;

    constructor(
        uuid: string,
        selection: GroupableElements
    ) {
        this.uuid = uuid;
        this.elementRefSet = selection;
        this.elementRefSet.forEach(ele => {
            ele.renderElements?.root.classed("captured", true);
        })
    }

    /**
     * 群组所包含的元素
     */
    public elementRefSet?: GroupableElements;

    public getContainedElements(): {
        nodes: PatternNode[],
        edges: PatternEdge[],
        multiplier: number,
    } {
        const nodes: PatternNode[] = [];
        const edges: PatternEdge[] = [];
        this.elementRefSet?.forEach(ele => {
            if (ele.elementType === VisualElementType.Node) {
                nodes.push(ele)
            }
            else if (ele.elementType === VisualElementType.Edge) {
                edges.push(ele)
            }
        })
        return { nodes, edges, multiplier: this._multipiler ?? 0 }
    }

    private getPath(): string {
        let path: string = ""
        this.elementRefSet?.forEach(ele => {
            if (ele.elementType == VisualElementType.Edge) {
                path += `M${ele.from.logicPosition.x} ${ele.from.logicPosition.y}L${ele.to.logicPosition.x} ${ele.to.logicPosition.y} `
            }
        })
        return path;
    }

    public renderElements?: RenderElements
    public attachTo(parent: D3<SVGGElement>) {
        let path: string = ""

        const group = parent.append("g")
            .attr('class', 'group-g')
            .attr('group-uuid', this.uuid);

        const edgeShadows = group.append("g").attr("class", "edge-shadow").attr('opacity', 0);
        const nodeShadows = group.append("g").attr("class", "node-shadow").attr('opacity', 0.8);

        /**
         * 产生一些类似阴影的视觉效果，包括 node 和 arrow
         */
        this.elementRefSet?.forEach(ele => {
            if (ele.elementType == VisualElementType.Edge) {
                path += `M${ele.from.logicPosition.x} ${ele.from.logicPosition.y}L${ele.to.logicPosition.x} ${ele.to.logicPosition.y} `

                if (this.elementRefSet!.has(ele.from)) {
                    if (this.elementRefSet!.has(ele.to)) {
                        const p1from = addVector(ele.from.logicPosition, delta);
                        const p1to = addVector(ele.to.logicPosition, delta);
                        path += `M${p1from.x} ${p1from.y}L${p1to.x} ${p1to.y} `
                        const p2from = addVector(ele.from.logicPosition, delta2);
                        const p2to = addVector(ele.to.logicPosition, delta2);
                        path += `M${p2from.x} ${p2from.y}L${p2to.x} ${p2to.y} `
                        const arr1 = new Arrow(
                            p1from, p1to,
                            18, true,
                        )
                        const arr2 = new Arrow(
                            p2from, p2to,
                            18, true,
                        )
                        arr1.attachTo(edgeShadows);
                        arr2.attachTo(edgeShadows);
                    }
                    else {
                        const p1from = addVector(ele.from.logicPosition, delta);
                        const p1to = (ele.to.logicPosition);
                        path += `M${p1from.x} ${p1from.y}L${p1to.x} ${p1to.y} `
                        const p2from = addVector(ele.from.logicPosition, delta2);
                        const p2to = (ele.to.logicPosition);
                        path += `M${p2from.x} ${p2from.y}L${p2to.x} ${p2to.y} `
                        const arr1 = new Arrow(
                            p1from, p1to,
                            18, true,
                        )
                        const arr2 = new Arrow(
                            p2from, p2to,
                            18, true,
                        )
                        arr1.attachTo(edgeShadows);
                        arr2.attachTo(edgeShadows);
                    }
                }
                else if (this.elementRefSet!.has(ele.to)) {
                    const p1from = (ele.from.logicPosition);
                    const p1to = addVector(ele.to.logicPosition, delta);
                    path += `M${p1from.x} ${p1from.y}L${p1to.x} ${p1to.y} `
                    const p2from = (ele.from.logicPosition);
                    const p2to = addVector(ele.to.logicPosition, delta2);
                    path += `M${p2from.x} ${p2from.y}L${p2to.x} ${p2to.y} `

                    const arr1 = new Arrow(
                        p1from, p1to,
                        18, true,
                    )
                    const arr2 = new Arrow(
                        p2from, p2to,
                        18, true,
                    )
                    arr1.attachTo(edgeShadows);
                    arr2.attachTo(edgeShadows);
                }
            }
            else if (ele.elementType == VisualElementType.Node) {
                const c = new Color(ele.ontologyClass.colorSlot.primary)
                const p1 = addVector(ele.logicPosition, delta)
                const p2 = addVector(ele.logicPosition, delta2)
                nodeShadows.append('circle')
                    .attr('class', 'node-shadow')
                    .attr('r', 10)
                    .attr('fill', c.lighten(0.45).alpha(0.55).string())
                    .attr('cx', ele.logicPosition.x)
                    .attr('cy', ele.logicPosition.y)

                    .transition()
                    .attr('cx', p1.x)
                    .attr('cy', p1.y)
                    .duration(400)


                nodeShadows.append('circle')
                    .attr('class', 'node-shadow')
                    .attr('r', 10)
                    .attr('fill', c.lighten(0.22).alpha(0.65).string())

                    .attr('cx', ele.logicPosition.x)
                    .attr('cy', ele.logicPosition.y)

                    .transition()
                    .attr('cx', p2.x)
                    .attr('cy', p2.y)
                    .duration(400)
            }
        })

        const mouseLayer = group.append('path')
            .attr('d', path)
            .attr('stroke-width', 38)
            .classed("aggr-hover", true);

        this.renderElements = {
            root: group,
            nodeShadows,
            edgeShadows,
            mouse: mouseLayer
        }
        edgeShadows.transition().attr("opacity", 0.16).duration(700);

    }

    public break(): (PatternNode | PatternEdge)[] {
        this.elementRefSet?.forEach(ele => {
            ele.renderElements?.root.classed("captured", false);
        })
        const refs = [...this.elementRefSet!];
        this.elementRefSet = undefined;
        this.renderElements?.root.remove();
        this.renderElements = undefined;
        return refs;
    }

    public focus() {

    }

    public blur() {

    }

    public asObject(): any {
        return {

        }
    }


    private _isDisabled = false;
    public setDisabled(disabled: boolean) {
        if (this._isDisabled !== disabled) {
            this._isDisabled = disabled;
            if (disabled) {
                this.renderElements?.root.attr('disabled', true);
                console.log(this.elementRefSet);
                this.elementRefSet?.forEach(ele => {
                    ele.setDisabled(true);
                })
            }
            else {
                this.renderElements?.root.attr('disabled', false);
                this.elementRefSet?.forEach(ele => {
                    ele.setDisabled(false);
                })
            }
        }
    }


    public getDisabled() {
        return this._isDisabled;
    }

    public on(eventName: string, listener: (event: any) => void) {
        return this.renderElements?.root.on(eventName, listener)
    }

    /**
     * 匹配时需要重复的次数
     */
    public _multipiler?: number
    public setMultiplier(multiplier?: number) {
        this._multipiler = multiplier;
    }
}