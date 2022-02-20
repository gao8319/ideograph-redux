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
import { CommonModel } from "../utils/common/model";
import { IConstraint, IPatternEdge, IPatternNode } from "../utils/common/graph";
import { isNotEmpty } from "../utils/common/utils";
import { Dictionary } from "lodash";


export enum RaiseMessageType{
    Error,
    Warning,
    Success,
}

export type RaiseMessageCallback = (message: string, type: RaiseMessageType, asInnerHtml?: boolean) => void;

export class PatternGraphEngine {

    // TODO: Inject History Manager
    public readonly model: CommonModel.Root
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
    public editPayload: string | number | null = null


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


    private _onNodeCreatedCallback?: (n: IPatternNode) => void;
    private _onEdgeCreatedCallback?: (e: IPatternEdge) => void;
    private _onConstraintCreatedCallback?: (c: IConstraint) => void;
    private _onRaiseMessageCallback?: RaiseMessageCallback;
    public setOnNodeCreatedCallback = (cb: typeof this._onNodeCreatedCallback) => { this._onNodeCreatedCallback = cb; }
    public setOnEdgeCreatedCallback = (cb: typeof this._onEdgeCreatedCallback) => { this._onEdgeCreatedCallback = cb; }
    public setOnConstraintCreatedCallback = (cb: typeof this._onConstraintCreatedCallback) => { this._onConstraintCreatedCallback = cb; }
    public setRaiseMessageCallback = (cb: typeof this._onRaiseMessageCallback) => { this._onRaiseMessageCallback = cb; }


    private nodeDict: Dictionary<PatternNode> = {};
    private edgeDict: Dictionary<PatternEdge> = {};

    constructor(model: CommonModel.Root, container: HTMLDivElement) {
        // debugger;
        this.model = model;
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
                if (!isNotEmpty(this.editPayload)) {
                    // Clear up works
                    this.nodeIndicator?.remove();
                    this.nodeIndicator = undefined;
                }
                else {
                    const targetColorSet = this.model.colorSlots[this.editPayload!].colorSlot ?? { primary: '#b0b1b4' };
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
            case EditMode.CreatingEdgeFrom: {

                break;
            }
            case EditMode.CreatingEdgeTo: {
                if (!this.mouseIndicatorLayer) break;

                if (isNotEmpty(this.createEdgeFrom)) {
                    if (this.mouseHoveringAtNode && !this.mouseHoveringAtNode.getDisabled()) {
                        const newArrow = new Arrow(
                            this.createEdgeFrom!.logicPosition,
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
                                this.createEdgeFrom!.logicPosition,
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
                if (isNotEmpty(this.editPayload)) {
                    const oc = this.model.colorSlots[this.editPayload!];
                    if (oc) {

                        const n = new PatternNode(
                            oc,
                            { x: ev.offsetX, y: ev.offsetY },
                            nanoid()
                        )
                        this._onNodeCreatedCallback?.(n.asObject())
                        this.nodeDict[n.uuid] = n;

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
            case EditMode.CreatingEdgeFrom: {
                this.focusedElement = null;

                break;
            }
            case EditMode.CreatingEdgeTo: {
                Object.values(this.nodeDict).forEach(to => {
                    to.setDisabled(false);
                })
                Object.values(this.edgeDict).forEach(_n => _n.setDisabled(false))
                this.focusedElement = null;
                this.editMode = EditMode.CreatingEdgeFrom;
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
        if (this.editMode === EditMode.CreatingEdgeFrom) {
            this.createEdgeFrom = n;
            this.focusedElement = n;
            this.editMode = EditMode.CreatingEdgeTo;

            const createEdgeFromClassId = n.ontologyClass.id
            Object.values(this.nodeDict).forEach(to => {
                if (
                    this.model.connectable[createEdgeFromClassId].to.includes(to.ontologyClass.id)
                    || n.uuid === to.uuid
                ) {
                    to.setDisabled(false);
                }
                else {
                    to.setDisabled(true);
                }
            })

            Object.values(this.edgeDict).forEach(_n => _n.setDisabled(true))
        }
        else if (this.editMode === EditMode.CreatingEdgeTo) {

            if (isNotEmpty(this.createEdgeFrom)) {

                if (n.getDisabled()) {
                    // debugger;
                    this._onRaiseMessageCallback?.(
                        `无法添加从&thinsp;<b>${this.createEdgeFrom!.ontologyClass.name}</b>&thinsp;到&thinsp;<b>${n.ontologyClass.name}</b>&thinsp;的边约束`,
                        RaiseMessageType.Error,
                        true
                    )
                    return;
                };

                Object.values(this.nodeDict).forEach(_n => _n.setDisabled(false))
                Object.values(this.edgeDict).forEach(_n => _n.setDisabled(false))

                const e = new PatternEdge(
                    this.createEdgeFrom!,
                    n,
                    true,
                    nanoid()
                )
                this._onEdgeCreatedCallback?.(e.asObject())
                this.edgeDict[e.uuid] = e;

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
            this.editMode = EditMode.CreatingEdgeFrom;
        }
        else {
            this.focusedElement = n;
        }
        ev.stopPropagation();
    }


    private mouseHoveringAtNode: PatternNode | null = null;
    private onNodePointerEnter = (n: PatternNode, ev: PointerEvent) => {
        if (this.editMode === EditMode.CreatingEdgeTo && this.createEdgeFrom) {
            this.mouseHoveringAtNode = n
        }
    }
    private onNodePointerLeave = (n: PatternNode, ev: PointerEvent) => {
        if (this.editMode === EditMode.CreatingEdgeTo && this.createEdgeFrom) {
            this.mouseHoveringAtNode = null
        }
    }



    private onEdgeClick = (e: PatternEdge, ev: MouseEvent) => {
        if (this.editMode >= 2) {
            this.createEdgeFrom = null;
            this.editMode = EditMode.CreatingEdgeFrom;
        }
        this.focusedElement = e;
        ev.stopPropagation();
    }
}
