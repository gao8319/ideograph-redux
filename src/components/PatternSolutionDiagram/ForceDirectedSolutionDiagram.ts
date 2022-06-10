import _ from "lodash";
import * as d3 from 'd3';
import { Solution } from "../../services/PatternSolution";
import type { SimulationNodeDatum } from "d3";
import { ColorSlot, IColorSlot } from "../../engine/visual/ColorSlot";
import { CommonModel } from "../../utils/common/model";
import { Arrow } from "../../engine/elements/Arrow";
import { addVector } from "../../utils/common/layout";

/**
 * 使用 d3-force 绘制子图的力导向图
 */
export class ForceDirectedSolutionDiagram {

    public layout: {
        id: string,
        x: number,
        y: number,
        type: string,
    }[];

    public layoutHashmap: Record<string, {
        id: string,
        x: number,
        y: number,
        type: string,
    }>

    private colorSlots: Record<string, IColorSlot>;

    public pattern: Solution.Pattern;

    private patternEdges: Solution.PatternEdge[];

    public solutions: Solution.PatternSolution[];

    public constructor(aggregatedPattern: Solution.AggregatedPatternSolution[], model: CommonModel.ISerializedRoot | null) {
        const pattern = aggregatedPattern[0].pattern;
        this.pattern = pattern;
        this.patternEdges = pattern.edges;

        const nodeIdMap = Object.fromEntries(pattern.nodes.map((it, index) => [it.patternId, index] as [string, number]))

        const links = pattern.edges.map((it, i) => {
            const source: SimulationNodeDatum = {
                index: nodeIdMap[it.fromPatternId],
            }
            const target: SimulationNodeDatum = {
                index: nodeIdMap[it.toPatternId],
            }
            return {
                source,
                target,
                id: it.patternId,
            }
        })
        const nodes = pattern.nodes.map((it, i) => ({ id: it.patternId, index: i }))
        const forceNode = d3.forceManyBody();
        const forceLink = d3.forceLink(links);//.id(({ index: i }) => i !== undefined ? links[i].id : "");

        d3.forceSimulation(nodes)
            .force("link", forceLink)
            .force("charge", forceNode)
            .force("center", d3.forceCenter())
            .tick(20);

        // @ts-ignore
        this.layout = nodes.map((n, i) => ({ ...n, type: pattern.nodes[i].type }));

        this.solutions = aggregatedPattern.flatMap(it => it.solution);
        this.colorSlots = model ? Object.fromEntries(model.classes.map((it, index) => [it.name, it.colorSlot])) : {}

        // console.log(this.solutions)
        this.layoutHashmap = _.keyBy(this.layout, it => it.id);
        // debugger
    }

    public attachTo(
        svg: SVGSVGElement,
        index: number,
        setCallout: (prop?: [SVGElement, Solution.WorkspaceEdge | Solution.WorkspaceNode]) => void
    ) {
        const svgSel = d3.select(svg);
        const center = svg.getBoundingClientRect();
        const tlayer = svgSel.append("g")//.style("transform", "translate(50%, 50%)")
        const arrowLayer = tlayer.append("g").style('opacity', 0.4);
        const g = tlayer.append("g");


        const vec = {
            x: + center.width / 2,
            y: + center.height / 2
        }

        this.patternEdges.forEach(e => {
            new Arrow(
                addVector(this.layoutHashmap[e.fromPatternId], vec),
                addVector(this.layoutHashmap[e.toPatternId], vec),
                12, true,
            ).attachTo(arrowLayer)
        })




        g.selectAll("circle")
            .data(this.layout)
            .enter()
            .append("circle")
            .attr("cx", (d, i) => d.x + center.width / 2)
            .attr("cy", (d, i) => d.y + center.height / 2)
            .attr("r", 8)
            .attr("fill", (d, i) => this.colorSlots[d.type].primary)
            .on('mouseenter', (t, d) => {
                setCallout([t, this.solutions[index].nodes[d.id]])
            })
            .on('mouseleave', (t, d) => {
                setCallout(undefined)
            })

        g.selectAll("text")
            .data(this.layout)
            .enter()
            .append("text")
            .attr("x", (d, i) => d.x + center.width / 2)
            .attr("y", (d, i) => d.y + 14 + center.height / 2)
            .attr("class", "aggr-node-text")
            .attr("fill", (d, i) => this.colorSlots[d.type].darkened)
            .text((d, i) => this.solutions[index].nodes[d.id].name)

        svgSel.call(
            d3.zoom().on('zoom', e => {
                requestAnimationFrame(() => {
                    const t = e.transform.toString();
                    g.attr('transform', t);
                    arrowLayer.attr('transform', t);
                })
            }) as any
        )

    }

    public getSolutionSize() {
        // console.log(Math.ceil(this.solutions.length / 4));
        return Math.ceil(this.solutions.length / 4)
    }
}