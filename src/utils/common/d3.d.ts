import type { Selection } from 'd3'
declare global {
    export type D3<GElement extends d3.BaseType> = d3.Selection<GElement, any, any, any>
}
// export type D3<T extends HTMLElement> = d3.Selection<d3.BaseType, any, T, any>