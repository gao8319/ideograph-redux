import * as d3 from 'd3';

/**
 * 一些和二维图形有关的计算 utils
 */

export interface IPoint {
    x: number,
    y: number,
}

export const center = (...args: IPoint[]): IPoint => {
    return {
        x: d3.sum(args, p => p.x) / args.length,
        y: d3.sum(args, p => p.y) / args.length,
    }
}

export const addVector = (p: IPoint, vec: IVector): IPoint => {
    return {
        x: p.x + vec.x,
        y: p.y + vec.y
    }
}

export type IVector = IPoint

export const getVector = (from: IPoint, to: IPoint): IVector => ({
    x: to.x - from.x,
    y: to.y - from.y
})

export const getDistanceSquared = (from: IPoint, to: IPoint) => ((from.x - to.x) ** 2) + ((from.y - to.y) ** 2)

export const getAngleDegs = (from: IPoint, to: IPoint): number => {
    const x = to.x - from.x;
    const y = to.y - from.y;
    const degs = Math.atan2(y, x) / Math.PI * 180
    return degs
}

export interface IBox {
    width: number,
    height: number,
}

export type IRect = IPoint & IBox

export type IOffsetRect = {
    top: number,
    bottom: number,
    right: number,
    left: number
}

export class Rectangle implements IRect, DOMRect {
    public x: number;
    public y: number;
    public width: number;
    public height: number;

    constructor(rect: IRect) {
        this.x = rect.x;
        this.y = rect.y;
        this.width = rect.width;
        this.height = rect.height;
    }

    public get centerX() { return this.x + this.width / 2 };
    public get centerY() { return this.y + this.height / 2 };
    public get left() { return this.x };
    public get right() { return this.x + this.width };
    public get top() { return this.y };
    public get bottom() { return this.y + this.height };
    public toJSON() { return `{x:${this.x},y:${this.y},width:${this.width},height:${this.height}}` }
}