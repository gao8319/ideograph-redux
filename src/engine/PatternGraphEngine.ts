import { ColoredOntologyClass, IOntologyClass } from "./ontology/OntologyClass";
import { flattenOntologyTree, IOntologyModel } from "./ontology/OntologyModel";
import { ColorSlot } from "./visual/ColorSlot";
import { EditMode } from "./visual/EditMode";
import { IFocusableElement, IVisualElement, VisualElementType } from "./visual/VisualElement";
import * as d3 from 'd3';
import './visual/PatternGraphEngine.css'
import { figmaColorScheme } from "./visual/ColorSchemes";
import { PatternNode } from "./visual/PatternNode";
import { PatternEdge } from "./visual/PatternEdge";
import { Arrow } from "./elements/Arrow";
import { nanoid } from "@reduxjs/toolkit";

export class PatternGraphEngine {

    // TODO: Inject History Manager
    public readonly model: IOntologyModel
    public readonly coloredModel: Record<string, ColoredOntologyClass>
    // public colorSlots: Record<string, ColorSlot>

    private _editMode = EditMode.Default;
    public get editMode(): EditMode {
        return this._editMode;
    }
    public set editMode(e: EditMode) {

        if (this._editMode === e) return;
        this._editMode = e;
        //Clean up
        this.mouseIndicatorLayer?.attr('transform', 'translate(0,0)');
        this.mouseIndicatorLayer?.selectChildren('*').remove();
        this.nodeIndicator = undefined;
        this.connectionIndicator = undefined;
    }
    public editPayload: string | null = null


    public renderContainer: HTMLDivElement
    public svgLayer: D3<SVGSVGElement>
    public coreLayer: D3<SVGGElement>


    /**
     * Focus handlers
     */
    private _focusedElement: IFocusableElement | null = null
    private _focusedElementChangedCallback?: (to: IFocusableElement | null, from: IFocusableElement | null) => void
    public setFocusedElementChangedCallback(
        cb: typeof this._focusedElementChangedCallback
    ) {
        this._focusedElementChangedCallback = cb
    };
    public get focusedElement() { return this._focusedElement }
    public set focusedElement(e: IFocusableElement | null) {
        if (this._focusedElement === e) return;

        this._focusedElementChangedCallback?.(e, this._focusedElement);

        this._focusedElement?.blur();
        e?.focus();
        this._focusedElement = e;
    }

    constructor(model: IOntologyModel, container: HTMLDivElement) {
        this.model = model;
        this.coloredModel = Object.fromEntries(flattenOntologyTree(model).map(
            (it, index) => [it.className, { ...it, colorSlot: new ColorSlot(figmaColorScheme[index]) }]
        ));
        // this.colorSlots = Object.fromEntries(
        //     this.flattenedModel.map(
        //         (it, index) => [it.className, new ColorSlot(figmaColorScheme[index])]
        //     )
        // );
        this.renderContainer = container;
        this.svgLayer = d3.select(container)
            .append('svg')
            .attr('class', 'engine-svg');
        this.coreLayer = this.svgLayer.append('g')
            .attr('class', 'engine-core')
        this.mouseIndicatorLayer = this.svgLayer.append('g')
            .attr('class', 'engine-mouse-indicator');


        this.renderContainer.addEventListener(
            "pointermove",
            this.onPointerMove
        )
        this.renderContainer.addEventListener(
            "pointerleave",
            this.onPointerLeave
        )
        this.renderContainer.addEventListener(
            "pointerenter",
            this.onPointerMove
        )
        this.renderContainer.addEventListener(
            "click",
            this.onClick
        )
    }

    public detach() {
        this.renderContainer.innerHTML = ''
    }


    protected mouseIndicatorLayer?: D3<SVGGElement>;
    protected nodeIndicator?: D3<SVGCircleElement>;
    protected connectionIndicator?: Arrow;

    public setEditModeWithPayload(editMode: EditMode, payload: string) {
        this.editPayload = payload;
        this.editMode = editMode;
    }

    private onPointerMove = (ev: PointerEvent) => {
        switch (this.editMode) {
            case EditMode.Default: {
                break;
            }
            case EditMode.CreatingNode: {
                if (!this.editPayload) {
                    // Clear up works
                    this.nodeIndicator?.remove();
                    this.nodeIndicator = undefined;
                }
                else {
                    const targetColorSet = this.coloredModel[this.editPayload].colorSlot ?? { primary: '#b0b1b4' };
                    this.mouseIndicatorLayer?.attr('transform', `translate(${ev.offsetX}, ${ev.offsetY})`)
                    if (!this.nodeIndicator) {
                        this.nodeIndicator = this.mouseIndicatorLayer
                            ?.append('circle')
                            .attr('r', 12)
                            .attr('cx', 0)
                            .attr('cy', 0)
                            .attr('opacity', 0.5)
                    }
                    if (this.nodeIndicator) {
                        this.nodeIndicator.attr('fill', targetColorSet.primary)
                    }
                }
                break;
            }
            case EditMode.CreatingEgdeFrom: {
                break;
            }
            case EditMode.CreatingEgdeTo: {
                if (!this.mouseIndicatorLayer) break;
                if (this.createEdgeFrom) {
                    if (this.mouseHoveringAtNode) {
                        const newArrow = new Arrow(
                            this.createEdgeFrom.logicPosition,
                            this.mouseHoveringAtNode.logicPosition,
                            18, true);
                        if (!this.connectionIndicator) {
                            this.connectionIndicator = newArrow;
                            this.connectionIndicator.attachTo(this.mouseIndicatorLayer)
                                .attr('opacity', 0.4)
                                .attr('stroke-dasharray', 'none');
                        }
                        else {
                            this.connectionIndicator.applyAttributes(newArrow.getAttributes())
                            this.connectionIndicator
                                .attr('stroke-dasharray', 'none');
                        }
                    }
                    else {
                        if (!this.connectionIndicator) {
                            this.connectionIndicator = new Arrow(
                                this.createEdgeFrom.logicPosition,
                                { x: ev.offsetX, y: ev.offsetY },
                                18, false);
                            this.connectionIndicator.attachTo(this.mouseIndicatorLayer)
                                .attr('opacity', 0.4)
                                .attr('stroke-dasharray', '8, 8');
                        }
                        else {
                            this.connectionIndicator.modifyEndpoint({ x: ev.offsetX, y: ev.offsetY })
                            this.connectionIndicator
                                .attr('stroke-dasharray', '8, 8');
                        }
                    }
                }
                break;
            }
            default: {
                break;
            }
        }
    }

    private onPointerLeave = (ev: PointerEvent) => {
        // Clear up works
        this.nodeIndicator?.remove();
        this.nodeIndicator = undefined;
    }

    private onClick = (ev: MouseEvent) => {
        switch (this.editMode) {
            case EditMode.Default: {
                this.focusedElement = null;
                break;
            }
            case EditMode.CreatingNode: {
                if (this.editPayload) {
                    const oc = this.coloredModel[this.editPayload];
                    if (oc) {
                        const n = new PatternNode(
                            oc,
                            { x: ev.offsetX, y: ev.offsetY },
                            nanoid()
                        )
                        n.attachTo(this.coreLayer);
                        setTimeout(
                            () => {
                                this.focusedElement = n;
                            }, 0
                        )
                        n.on('click', clickEvent => {
                            this.onNodeClick(n, clickEvent)
                        })
                        n.on('pointerenter', mouseEvent => {
                            this.onNodePointerEnter(n, mouseEvent)
                        })
                        n.on('pointerleave', mouseEvent => {
                            this.onNodePointerLeave(n, mouseEvent)
                        })
                        this.editPayload = null;
                        this.nodeIndicator?.remove();
                        this.nodeIndicator = undefined;
                    }
                }
                else {
                    this.focusedElement = null;
                }
                break;
            }
            case EditMode.CreatingEgdeFrom: {
                this.focusedElement = null;
                break;
            }
            case EditMode.CreatingEgdeTo: {
                this.focusedElement = null;
                this.editMode = EditMode.CreatingEgdeFrom;
                break;
            }
            default: {
                break;
            }
        }
    }


    private createEdgeFrom: PatternNode | null = null;
    private onNodeClick = (n: PatternNode, ev: MouseEvent) => {
        // console.log(this.editMode, this.createEdgeFrom);
        if (this.editMode === EditMode.CreatingEgdeFrom) {
            this.createEdgeFrom = n;
            this.focusedElement = n;
            this.editMode = EditMode.CreatingEgdeTo;
        }
        else if (this.editMode === EditMode.CreatingEgdeTo) {
            if (this.createEdgeFrom) {
                const e = new PatternEdge(
                    this.createEdgeFrom,
                    n,
                    true,
                    nanoid()
                )
                e.attachTo(this.coreLayer);
                e.on('click', clickEvent => {
                    this.onEdgeClick(e, clickEvent)
                });
                setTimeout(
                    () => {
                        this.focusedElement = e;
                    }, 0
                )
            }
            this.createEdgeFrom = null;
            this.mouseHoveringAtNode = null;
            this.editMode = EditMode.CreatingEgdeFrom;
        }
        else {
            this.focusedElement = n;
        }
        ev.stopPropagation();
    }


    private mouseHoveringAtNode: PatternNode | null = null;
    private onNodePointerEnter = (n: PatternNode, ev: PointerEvent) => {
        if (this.editMode === EditMode.CreatingEgdeTo && this.createEdgeFrom) {
            this.mouseHoveringAtNode = n
        }
    }
    private onNodePointerLeave = (n: PatternNode, ev: PointerEvent) => {
        if (this.editMode === EditMode.CreatingEgdeTo && this.createEdgeFrom) {
            this.mouseHoveringAtNode = null
        }
    }



    private onEdgeClick = (e: PatternEdge, ev: MouseEvent) => {
        if (this.editMode >= 2) {
            this.createEdgeFrom = null;
            this.editMode = EditMode.CreatingEgdeFrom;
        }
        this.focusedElement = e;
        ev.stopPropagation();
    }
}
