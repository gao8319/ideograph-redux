
import _ from "lodash";
import { Solution } from "../../services/PatternSolution";
import { IPatternEdge, IPatternNode } from "../../utils/common/graph";
import { IBox, IOffsetRect, IPoint, IRect } from "../../utils/common/layout";
import * as d3 from 'd3';
import { Arrow } from "../../engine/elements/Arrow";
// import './SolutionDiagram.css'

// interface SolutionDiagramPainter {
//     paintOn: (svg: SVGSVGElement) => void;
// }

const getBoundingBox = <T extends { position: IPoint }>(boxes: T[]): IOffsetRect => {
    const xArray = boxes.map(b => b.position.x)
    const yArray = boxes.map(b => b.position.y)
    const top = Math.min(...yArray)
    const bottom = Math.max(...yArray)
    const left = Math.min(...xArray)
    const right = Math.max(...xArray)
    return { top, bottom, left, right }
}

export class SolutionDiagramCore {
    // private solutions: Solution.PatternSolution[];

    private patternNodes: IPatternNode[];

    private padding: number;

    private box: IBox;

    private layouts: IPoint[];

    private patternEdges: IPatternEdge[];

    constructor(
        // solutions: Solution.PatternSolution[],
        patternNodes: IPatternNode[],
        patternEdges: IPatternEdge[],
        box: IBox = { width: 320, height: 240 },
        paddingByPixels: number = 20,
        additionalScale: number = 1,
    ) {
        // this.solutions = solutions;
        this.patternNodes = patternNodes;
        this.patternEdges = patternEdges;
        this.box = box;
        this.padding = paddingByPixels;

        // if (layoutUnscaled) {
        //     this.layouts = this.patternNodes.map(n => n.position)

        //     this.workspaceNodeInvertedIndex = Object.fromEntries(this.patternNodes.map((n, index) => [n.id, index]))
        //     this.workspaceEdgeInvertedIndex = Object.fromEntries(
        //         this.patternEdges.map(
        //             (e, index) => [
        //                 e.id,
        //                 [
        //                     this.workspaceNodeInvertedIndex[e.from],
        //                     this.workspaceNodeInvertedIndex[e.to]
        //                 ]
        //             ]
        //         )
        //     )

        // }
        // else {
        this.layouts = this.getLayouts(additionalScale);
        // }
    }

    private _scale = 1;

    private getLayouts(additionalScale: number): IPoint[] {
        const logicBox = getBoundingBox(this.patternNodes);
        const paddedTop = this.padding;
        const paddedBottom = this.box.height - this.padding;
        const paddedLeft = this.padding;
        const paddedRight = this.box.width - this.padding;

        const logicWidth = logicBox.right - logicBox.left;
        const logicHeight = logicBox.bottom - logicBox.top;

        const verticalScale = (paddedRight - paddedLeft) / logicWidth;
        const horizontalScale = (paddedBottom - paddedTop) / logicHeight;

        const scale = Math.min(verticalScale, horizontalScale) * additionalScale;
        this._scale = scale;
        // debugger;

        const logicHorizontalCenter = (logicBox.left + logicBox.right) / 2;
        const logicVertivalCenter = (logicBox.bottom + logicBox.top) / 2;

        const verticalMapper = (y: number) => (y - logicVertivalCenter) * scale + this.box.height / 2;
        const horizontalMapper = (x: number) => (x - logicHorizontalCenter) * scale + this.box.width / 2;

        const nodeLayouts: IPoint[] = this.patternNodes.map(pn => ({
            x: horizontalMapper(pn.position.x),
            y: verticalMapper(pn.position.y)
        }))

        this.workspaceNodeInvertedIndex = Object.fromEntries(this.patternNodes.map((n, index) => [n.id, index]))
        this.workspaceEdgeInvertedIndex = Object.fromEntries(
            this.patternEdges.map(
                (e, index) => [
                    e.id,
                    [
                        this.workspaceNodeInvertedIndex[e.from],
                        this.workspaceNodeInvertedIndex[e.to]
                    ]
                ]
            )
        )
        return nodeLayouts;
    }

    private workspaceNodeInvertedIndex!: Record<string, number>;
    private workspaceEdgeInvertedIndex!: Record<string, [number, number]>;

    public paintOnUnsolved = (svg: SVGSVGElement) => {

        const svgSelection = d3.select(svg).classed('transformed', true);

        const arrowLayer = svgSelection.append('g')//.attr('transform', `scale(${this._scale})`);

        Object.entries(this.patternEdges).forEach(
            e => {
                const pos = this.workspaceEdgeInvertedIndex[e[1].id]
                if (pos?.length >= 2)
                    new Arrow(
                        this.layouts[pos[0]],
                        this.layouts[pos[1]],
                        7,
                        true,
                        "narrowed"
                    ).attachTo(arrowLayer)

            }
        )

        svgSelection.append('g')//.attr('transform', `scale(${this._scale})`)
            .selectAll('circle')
            .data(this.patternNodes)
            .enter()
            .append('circle')
            .attr('r', 5)
            .attr('cx', (_, i) => this.layouts[i].x)
            .attr('cy', (_, i) => this.layouts[i].y)
            .attr('fill', (_, i) => this.patternNodes[i].class.colorSlot.primary)

        svgSelection.append('g')//.attr('transform', `scale(${this._scale})`)
            .selectAll('text')
            .data(this.patternNodes)
            .enter()
            .append('text')
            .classed('class-text', true)
            .attr('x', (_, i) => this.layouts[i].x)
            .attr('y', (_, i) => this.layouts[i].y + 5.5)
            .attr('fill', (_, i) => this.patternNodes[i].class.colorSlot.darkened)
            .text(d => d.class.name)

        return () => {
            svg.innerHTML = "";
        }
    }

    public paintOn = (svg: SVGSVGElement, solution: Solution.PatternSolution) => {
        const workspaceNodesSorted = this.patternNodes.map(pn => solution.nodes[pn.id]);

        const svgSelection = d3.select(svg);

        const arrowLayer = svgSelection.append('g');

        Object.entries(solution.edges).forEach(
            entry => {
                new Arrow(
                    this.layouts[this.workspaceEdgeInvertedIndex[entry[0]][0]],
                    this.layouts[this.workspaceEdgeInvertedIndex[entry[0]][1]],
                    12,
                    true
                ).attachTo(arrowLayer)
            }
        )

        svgSelection.append('g')
            .selectAll('circle')
            .data(workspaceNodesSorted)
            .enter()
            .append('circle')
            .attr('r', 8)
            .attr('cx', (_, i) => this.layouts[i].x)
            .attr('cy', (_, i) => this.layouts[i].y)
            .attr('fill', (_, i) => this.patternNodes[i].class.colorSlot.primary)


        svgSelection.append('g')
            .selectAll('text')
            .data(workspaceNodesSorted)
            .enter()
            .append('text')
            .classed('instance-text', true)
            .attr('x', (_, i) => this.layouts[i].x)
            .attr('y', (_, i) => this.layouts[i].y + 10)
            .attr('fill', (_, i) => this.patternNodes[i].class.colorSlot.constrained)
            .text(d => d.name)



        return () => {
            svgSelection.selectAll('*').remove();
        }
    }
}