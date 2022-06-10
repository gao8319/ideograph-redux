import './Arrow.css'
import * as d3 from 'd3'
import { IPoint } from '../../utils/common/layout';

type RenderElements = {
    root: D3<SVGGElement>,
    body: D3<SVGPathElement>,
    head: D3<SVGPathElement>,
}

const a = d3.select('g')

const arrowHeadPath = "M-9,6L0,0L-9,-6"

/**
 * 在 SVG 上绘制一个箭头
 */
export class Arrow {
    public from: IPoint;
    public to: IPoint;

    private avoidHead?: boolean;
    private avoidRadius;
    private avoidRadiusSquared;
    private additionalClass;

    private direction?: boolean;

    public renderElement?: RenderElements;

    constructor(
        from: IPoint,
        to: IPoint,
        avoidRadius?: number,
        avoidHead?: boolean,
        additionalClass?: string,
    ) {
        this.from = from;
        this.to = to;
        this.avoidRadius = avoidRadius ?? 0;
        this.avoidRadiusSquared = this.avoidRadius * this.avoidRadius;
        this.avoidHead = avoidHead ?? false;
        this.additionalClass = additionalClass;
    }

    public attachTo(parent: D3<SVGGElement>): D3<SVGGElement> {
        const elementGroup = parent.append('g')
            .attr('class', 'a-g');
        this.additionalClass && elementGroup.classed(this.additionalClass, true)

        const { bodyPath, headTransform } = this.getAttributes();
        // const hLayer = elementGroup.append('g')
        //     .attr('class', 'hover-layer')
        // const hbody = hLayer.append('path')
        //     .attr('class', 'a-body-h')
        //     .attr('d', bodyPath)
        //     .attr('transform', `translate(${this.from.x}, ${this.from.y})`)

        // const hhead = hLayer.append('path')
        //     .attr('class', 'a-head-h')
        //     .attr('d', arrowHeadPath)
        //     .attr('transform', headTransform)
        const body = elementGroup.append('path')
            .attr('class', 'a-body')
            .attr('d', bodyPath)
            .attr('transform', `translate(${this.from.x}, ${this.from.y})`)

        const head = elementGroup.append('path')
            .attr('class', 'a-head')
            .attr('d', arrowHeadPath)
            .attr('transform', headTransform)



        this.renderElement = {
            root: elementGroup,
            body,
            head,
        }

        return elementGroup;
    }

    public modifyEndpoint(to: IPoint) {
        const { bodyPath, headTransform } = this.getAttributes();
        this.to = to;
        this.renderElement?.body.attr('d', bodyPath)
        this.renderElement?.head.attr('transform', headTransform)
    }

    public applyAttributes(attr: ReturnType<typeof this.getAttributes>) {
        this.renderElement?.body.attr('d', attr.bodyPath)
        this.renderElement?.head.attr('transform', attr.headTransform)
    }

    public getAttributes = (): { bodyPath: string, headTransform: string } => {

        const deltaX = this.to.x - this.from.x;
        const deltaY = this.to.y - this.from.y;
        const delta2 = deltaY * deltaY + deltaX * deltaX;
        const degs = Math.atan2(deltaY, deltaX) / Math.PI * 180;
        const length = Math.sqrt(delta2)
        const startX = (this.avoidRadius / length * deltaX)
        const startY = (this.avoidRadius / length * deltaY)

        const headTransform = `translate(${this.avoidHead ? this.to.x - startX : this.to.x},${this.avoidHead ? this.to.y - startY : this.to.y}) rotate(${degs})`

        if (delta2 <= this.avoidRadiusSquared) {
            return { bodyPath: 'M0,0', headTransform };
        }
        else {
            const bodyPath = `M${startX},${startY}L${this.avoidHead ? deltaX - startX : deltaX},${this.avoidHead ? deltaY - startY : deltaY}`
            return { bodyPath, headTransform }
        }
    }

    // private getBodyPath(): string {
    //     return `M0,0L${this.to.x - this.from.x},${this.to.y - this.from.y}Z`
    // }

    // private getBodyTransform(): string {
    //     return `translate(${this.from.x}, ${this.from.y})`
    // }



    // private getHeadTransform(): string {
    //     return `translate(${this.to.x}, ${this.to.y}) rotate(${getAngleDegs(this.from, this.to)})`
    // }

    public remove() {
        this.renderElement?.root.remove();
    }

    public attr(name: string, value: any) {
        return this.renderElement?.root.attr(name, value)
    }

    

}