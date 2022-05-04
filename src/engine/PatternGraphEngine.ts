import { EditMode } from "./visual/EditMode";
import { IFocusableElement, VisualElementType } from "./visual/VisualElement";
import * as d3 from 'd3';
import './visual/PatternGraphEngine.css'
import { PatternNode } from "./visual/PatternNode";
import { PatternEdge } from "./visual/PatternEdge";
import { Arrow } from "./elements/Arrow";
import { nanoid } from "@reduxjs/toolkit";
import { CommonModel } from "../utils/common/model";
import { IConstraint, IPatternEdge, IPatternNode } from "../utils/common/graph";
import { isNotEmpty } from "../utils/common/utils";
import { Dictionary } from "lodash";
import { QueryForageItem } from "../utils/global/Storage";
import { center, getDistanceSquared, IPoint } from "../utils/common/layout";
import { nameCandidates } from "../utils/NameCandidates";


const applyCTM = (m: DOMMatrix, p: IPoint) => ({
    x: m.a * p.x + m.c * p.y + m.e,
    y: m.b * p.x + m.d * p.y + m.f
})

export enum RaiseMessageType {
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
        Object.values(this.nodeDict).forEach(_n => _n.setDisabled(false))
        Object.values(this.edgeDict).forEach(_n => _n.setDisabled(false))
    }
    public editPayload: string | number | null = null


    public renderContainer: HTMLDivElement
    public svgLayer: D3<SVGSVGElement>
    public nodeLayer: D3<SVGGElement>
    public edgeLayer: D3<SVGGElement>


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


    private _onNodeContextMenu?: (n: PatternNode, event: MouseEvent) => void;
    private _onNodeCreatedCallback?: (n: IPatternNode) => void;

    private _onEdgeSelectTypeCallback?: (
        position: IPoint,
        types: CommonModel.IRelation[],
        onSelectEdgeType: (type: CommonModel.IRelation) => void
    ) => void;

    private _onEdgeCreatedCallback?: (e: IPatternEdge) => void;
    private _onConstraintCreatedCallback?: (c: IConstraint) => void;
    private _onRaiseMessageCallback?: RaiseMessageCallback;
    private _assignNewName: (c: CommonModel.IClass) => string | undefined = c => {
        const className = c.name;
        return className + nameCandidates[0]
    }
    public setAssignNewName = (cb: typeof this._assignNewName) => { this._assignNewName = cb }
    public setOnNodeCreatedCallback = (cb: typeof this._onNodeCreatedCallback) => { this._onNodeCreatedCallback = cb; }
    public setOnEdgeCreatedCallback = (cb: typeof this._onEdgeCreatedCallback) => { this._onEdgeCreatedCallback = cb; }
    public setOnConstraintCreatedCallback = (cb: typeof this._onConstraintCreatedCallback) => { this._onConstraintCreatedCallback = cb; }
    public setRaiseMessageCallback = (cb: typeof this._onRaiseMessageCallback) => { this._onRaiseMessageCallback = cb; }
    public setOnNodeContextMenu = (cb: typeof this._onNodeContextMenu) => { this._onNodeContextMenu = cb; }

    public setOnEdgeSelectTypeCallback = (cb: typeof this._onEdgeSelectTypeCallback) => {
        this._onEdgeSelectTypeCallback = cb;
    }

    public notifyElementConstrained(ele: (IPatternNode | IPatternEdge) & {
        type: VisualElementType;
    }, isConstrained = true) {
        if (ele.type === VisualElementType.Node) {
            this.nodeDict[ele.id].isConstrained = isConstrained;
        } else {
            this.edgeDict[ele.id].isConstrained = isConstrained;
        }
    }

    public modifyAlias(alias: string | undefined, id: string) {
        this.nodeDict[id].alias = alias
    }
    private nodeDict: Dictionary<PatternNode> = {};
    private edgeDict: Dictionary<PatternEdge> = {};

    private zoomTransform?: d3.ZoomTransform;


    constructor(model: CommonModel.Root, container: HTMLDivElement) {
        // debugger;
        this.model = model;
        this.renderContainer = container;
        this.svgLayer = d3.select(container)
            .append('svg')
            .attr('class', 'engine-svg');

        this.svgLayer.on('contextmenu', (ev) => {
            ev.preventDefault();
        })
        this.edgeLayer = this.svgLayer.append('g')
            .attr('class', 'engine-core')
        this.nodeLayer = this.svgLayer.append('g')
            .attr('class', 'engine-core')
        const mouseRoot = this.svgLayer.append('g');
        this.mouseIndicatorLayer = mouseRoot.append('g')
            .attr('class', 'engine-mouse-indicator');
        this.eventProtecter = d3.select(this.renderContainer).append('div').node()!;

        this.svgLayer.call(
            d3.zoom().on('zoom', e => {
                requestAnimationFrame(() => {
                    const t = e.transform.toString();
                    this.zoomTransform = e.transform;
                    this.nodeLayer.attr('transform', t)
                    this.edgeLayer.attr('transform', t)
                    mouseRoot.attr('transform', t);
                })
            }) as any
        )

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
    protected eventProtecter: HTMLDivElement;
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

                    const newEv = this.zoomTransform?.invert([ev.offsetX, ev.offsetY]) ?? [ev.offsetX, ev.offsetY]
                    this.mouseIndicatorLayer?.attr('transform', `translate(${newEv[0]}, ${newEv[1]})`)
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
                break;
                if (!this.mouseIndicatorLayer) break;

                // if (isNotEmpty(this.createEdgeFrom)) {
                //     if (this.mouseHoveringAtNode && !this.mouseHoveringAtNode.getDisabled()) {
                //         const newArrow = new Arrow(
                //             this.createEdgeFrom!.logicPosition,
                //             this.mouseHoveringAtNode.logicPosition,
                //             18,
                //             true);
                //         if (!this.connectionIndicator) {
                //             this.connectionIndicator = newArrow;
                //             this.connectionIndicator
                //                 .attachTo(this.mouseIndicatorLayer)
                //                 .attr('opacity', 0.4)
                //                 .attr('stroke-dasharray', 'none');
                //         }
                //         else {
                //             this.connectionIndicator.applyAttributes(newArrow.getAttributes())
                //             this.connectionIndicator
                //                 .attr('stroke-dasharray', 'none');
                //         }
                //     }
                //     else {
                //         if (!this.connectionIndicator) {
                //             this.connectionIndicator = new Arrow(
                //                 this.createEdgeFrom!.logicPosition,
                //                 { x: ev.offsetX, y: ev.offsetY },
                //                 18, false);
                //             this.connectionIndicator.attachTo(this.mouseIndicatorLayer)
                //                 .attr('opacity', 0.4)
                //                 .attr('stroke-dasharray', '8, 8');
                //         }
                //         else {
                //             const newPoint = this.zoomTransform?.invert([ev.offsetX, ev.offsetY])
                //             this.connectionIndicator.modifyEndpoint({ x: newPoint ? newPoint[0] : ev.offsetX, y: newPoint ? newPoint[1] : ev.offsetY })
                //             this.connectionIndicator
                //                 .attr('stroke-dasharray', '8, 8');
                //         }
                //     }
                // }
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
        // this.mouseIndicatorLayer?.remove();
        // this.mouseIndicatorLayer = undefined;
        this.connectionIndicator?.remove();
        this.connectionIndicator = undefined;
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
                        const newEv = this.zoomTransform?.invert([ev.offsetX, ev.offsetY]) ?? [ev.offsetX, ev.offsetY]
                        const n = new PatternNode(
                            oc,
                            { x: newEv[0], y: newEv[1] },
                            nanoid(),
                            this._assignNewName(oc)
                        )
                        this._onNodeCreatedCallback?.(n.asObject())
                        this.nodeDict[n.uuid] = n;

                        n.attachTo(this.nodeLayer);
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
                        n.on('contextmenu', mouseEvent => {
                            this._onNodeContextMenu?.(n, mouseEvent)
                        })
                        n.renderElements?.root.call(
                            d3.drag<SVGGElement, any>()
                                .on('start', () => {
                                    this.dragStartNode = n
                                })
                                .on('drag', this._onNodeDrag)
                                .on('end', this._onNodeDragEnd)
                        )
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
                    || Object.values(this.edgeDict).findIndex(
                        it => (it.from.uuid === n.uuid && it.to.uuid === to.uuid)
                            || it.to.uuid === n.uuid && it.from.uuid === to.uuid
                    ) !== -1
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
                }
                else if (n.uuid === this.createEdgeFrom?.uuid) {
                    this._onRaiseMessageCallback?.(
                        `不支持自环`,
                        RaiseMessageType.Error,
                        true
                    )
                }
                else {
                    const edgeTypes = this.model.getRelationNames(this.createEdgeFrom?.ontologyClass!, n.ontologyClass!)

                    if (edgeTypes.length > 1) {
                        const point = center(this.createEdgeFrom!.logicPosition, n.logicPosition)
                        this._onEdgeSelectTypeCallback?.(
                            point,
                            edgeTypes,
                            (r) => {
                                const e = new PatternEdge(
                                    this.createEdgeFrom!,
                                    n,
                                    true,
                                    nanoid(),
                                    [],
                                    r.name
                                )
                                this._onEdgeCreatedCallback?.(e.asObject())
                                this.edgeDict[e.uuid] = e;

                                e.attachTo(this.edgeLayer);
                                e.on('click', clickEvent => {
                                    this.onEdgeClick(e, clickEvent)
                                });
                                setTimeout(
                                    () => {
                                        this.focusedElement = e;
                                    }, 0
                                )
                            }
                        )
                    }
                    else {
                        const edgeTypes = this.model.getRelationNames(this.createEdgeFrom?.ontologyClass!, n.ontologyClass!)
                        if (edgeTypes.length > 1) {
                            const point = center(this.createEdgeFrom!.logicPosition, n.logicPosition)
                            this._onEdgeSelectTypeCallback?.(
                                point,
                                edgeTypes,
                                (type) => {
                                    const e = new PatternEdge(
                                        this.createEdgeFrom!,
                                        n,
                                        true,
                                        nanoid(),
                                        [],
                                        type.name
                                    )
                                    this._onEdgeCreatedCallback?.(e.asObject())
                                    this.edgeDict[e.uuid] = e;

                                    e.attachTo(this.edgeLayer);
                                    e.on('click', clickEvent => {
                                        this.onEdgeClick(e, clickEvent)
                                    });
                                    setTimeout(
                                        () => {
                                            this.focusedElement = e;
                                        }, 0
                                    )
                                }
                            )
                        }
                        else {
                            const edgeTypeName = edgeTypes[0].name
                            const e = new PatternEdge(
                                this.createEdgeFrom!,
                                n,
                                true,
                                nanoid(),
                                [],
                                edgeTypeName
                            )
                            this._onEdgeCreatedCallback?.(e.asObject())
                            this.edgeDict[e.uuid] = e;

                            e.attachTo(this.edgeLayer);
                            e.on('click', clickEvent => {
                                this.onEdgeClick(e, clickEvent)
                            });
                            setTimeout(
                                () => {
                                    this.focusedElement = e;
                                }, 0
                            )
                        }
                    }
                }
            }
            Object.values(this.nodeDict).forEach(_n => _n.setDisabled(false))
            Object.values(this.edgeDict).forEach(_n => _n.setDisabled(false))

            this.focusedElement = null;
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

    private dragStartNode?: PatternNode;
    private isDragNailed = false;
    private _onNodeDrag = (ev: DragEvent & { sourceEvent: MouseEvent }) => {
        if (this.dragStartNode) {
            if (getDistanceSquared(this.dragStartNode.logicPosition, ev) > 200) {

                if (!this.isDragNailed && this.dragStartNode) {
                    this.setEditModeWithPayload(
                        EditMode.CreatingEdgeTo,
                        this.dragStartNode.uuid
                    )
                    this.createEdgeFrom = this.dragStartNode;

                    const createEdgeFromClassId = this.dragStartNode.ontologyClass.id
                    Object.values(this.nodeDict).forEach(to => {
                        if (
                            (this.model.connectable[createEdgeFromClassId].to.includes(to.ontologyClass.id)
                                || (this.dragStartNode?.uuid === to.uuid))
                            && Object.values(this.edgeDict).findIndex(
                                it => (it.from.uuid === this.dragStartNode!.uuid && it.to.uuid === to.uuid)
                                    || it.to.uuid === this.dragStartNode!.uuid && it.from.uuid === to.uuid
                            ) === -1
                        ) {
                            to.setDisabled(false);
                        }
                        else {
                            to.setDisabled(true);
                        }
                    })

                    Object.values(this.edgeDict).forEach(_n => _n.setDisabled(true));
                    this.isDragNailed = true;

                    this.eventProtecter.className = "event-protect-active"
                }
                // console.log(this.mouseHoveringAtNode)
                if (this.mouseHoveringAtNode && !this.mouseHoveringAtNode.getDisabled()) {

                    const newArrow = new Arrow(
                        this.createEdgeFrom!.logicPosition,
                        this.mouseHoveringAtNode.logicPosition,
                        18,
                        true);
                    if (!this.connectionIndicator) {
                        this.connectionIndicator = newArrow;
                        this.connectionIndicator
                            .attachTo(this.mouseIndicatorLayer!)
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
                        // const inverted = this.zoomTransform?.invert([ev.sourceEvent.x, ev.sourceEvent.x]);
                        // console.log(this.zoomTransform, ev, inverted);
                        // const start = this.zoomTransform?.apply([this.dragStartNode.logicPosition.x, this.dragStartNode.logicPosition.y])
                        this.connectionIndicator = new Arrow(
                            this.dragStartNode.logicPosition,
                            ev, 18, false);
                        this.connectionIndicator.attachTo(this.mouseIndicatorLayer!)
                            .attr('opacity', 0.4)
                            .attr('stroke-dasharray', '8, 8');
                    }
                    else {
                        // const inverted = this.zoomTransform?.invert([ev.sourceEvent.x, ev.sourceEvent.clientY]);

                        // const ctm = this.mouseIndicatorLayer?.node()?.getCTM();
                        // console.log(ctm && applyCTM(ctm, ev));

                        // console.log(
                        //     this.dragStartNode.logicPosition,
                        //     this.zoomTransform?.invert([ev.sourceEvent.clientX, ev.sourceEvent.clientY]),
                        //     this.zoomTransform?.invert([ev.sourceEvent.offsetX, ev.sourceEvent.offsetY]),
                        //     this.zoomTransform?.invert([ev.sourceEvent.pageX, ev.sourceEvent.pageY]),
                        //     this.zoomTransform?.invert([ev.x, ev.y]),
                        //     // @ts-ignore
                        //     this.zoomTransform?.invert([ev.subject.x, ev.subject.y]),

                        //     this.zoomTransform?.apply([ev.sourceEvent.clientX, ev.sourceEvent.clientY]),
                        //     this.zoomTransform?.apply([ev.sourceEvent.offsetX, ev.sourceEvent.offsetY]),
                        //     this.zoomTransform?.apply([ev.sourceEvent.pageX, ev.sourceEvent.pageY]),
                        //     this.zoomTransform?.apply([ev.x, ev.y]),
                        //     // @ts-ignore
                        //     this.zoomTransform?.apply([ev.subject.x, ev.subject.y]),


                        //     ([ev.sourceEvent.clientX, ev.sourceEvent.clientY]),
                        //     ([ev.sourceEvent.offsetX, ev.sourceEvent.offsetY]),
                        //     ([ev.sourceEvent.pageX, ev.sourceEvent.pageY]),
                        //     ([ev.x, ev.y]),
                        //     // @ts-ignore
                        //     ([ev.subject.x, ev.subject.y]),
                        // )
                        // console.log(inverted, ev)

                        this.connectionIndicator.modifyEndpoint(ev)
                        this.connectionIndicator
                            .attr('stroke-dasharray', '8, 8');
                    }
                }


            }
        }
    }


    private _onNodeDragEnd = (ev: DragEvent) => {
        if (this.dragStartNode && this.isDragNailed) {
            const n = this.mouseHoveringAtNode;
            if (isNotEmpty(this.createEdgeFrom) && isNotEmpty(n)) {

                if (n!.getDisabled()) {
                    // debugger;
                    this._onRaiseMessageCallback?.(
                        `无法添加从&thinsp;<b>${this.createEdgeFrom!.ontologyClass.name}</b>&thinsp;到&thinsp;<b>${n!.ontologyClass.name}</b>&thinsp;的边约束`,
                        RaiseMessageType.Error,
                        true
                    )
                }
                else if (n!.uuid === this.createEdgeFrom?.uuid) {
                    this._onRaiseMessageCallback?.(
                        `不支持自环`,
                        RaiseMessageType.Error,
                        true
                    )
                }
                else {
                    const edgeTypes = this.model.getRelationNames(this.createEdgeFrom?.ontologyClass!, n!.ontologyClass!)

                    const fromNode = this.createEdgeFrom!
                    const toNode = n!
                    if (edgeTypes.length > 1) {


                        const point = center(fromNode.logicPosition, toNode.logicPosition);
                        
                        const transformed = this.zoomTransform?.apply([point.x, point.y]) 
                        const t = transformed? {
                            x: transformed[0],
                            y: transformed[1] + 48,
                        } : point
                        
                        this._onEdgeSelectTypeCallback?.(
                            t,
                            edgeTypes,
                            (type) => {
                                const e = new PatternEdge(
                                    fromNode,
                                    toNode,
                                    true,
                                    nanoid(),
                                    [],
                                    type.name
                                )
                                this._onEdgeCreatedCallback?.(e.asObject())
                                this.edgeDict[e.uuid] = e;

                                e.attachTo(this.edgeLayer);
                                e.on('click', clickEvent => {
                                    this.onEdgeClick(e, clickEvent)
                                });
                                setTimeout(
                                    () => {
                                        this.focusedElement = e;
                                    }, 0
                                )
                            }
                        )
                    }
                    else {
                        const edgeTypeName = edgeTypes[0].name
                        const e = new PatternEdge(
                            fromNode,
                            toNode,
                            true,
                            nanoid(),
                            [],
                            edgeTypeName
                        )
                        this._onEdgeCreatedCallback?.(e.asObject())
                        this.edgeDict[e.uuid] = e;

                        e.attachTo(this.edgeLayer);
                        e.on('click', clickEvent => {
                            this.onEdgeClick(e, clickEvent)
                        });
                        setTimeout(
                            () => {
                                this.focusedElement = e;
                            }, 0
                        )
                    }
                }
            }
            Object.values(this.nodeDict).forEach(_n => _n.setDisabled(false))
            Object.values(this.edgeDict).forEach(_n => _n.setDisabled(false))

            this.focusedElement = null;
            this.createEdgeFrom = null;
            this.mouseHoveringAtNode = null;
            this.dragStartNode = undefined;
            this.isDragNailed = false;

            this.eventProtecter.className = "event-protect-inactive"
            this.editMode = EditMode.Default;
        }
    }




    public restoreFromFile = (file: QueryForageItem) => {

        Object.values(file.nodes.entities).forEach((n) => {
            const patternNode = new PatternNode(
                n!.class,
                n!.position,
                n!.id,
                n!.alias,
            )

            this._onNodeCreatedCallback?.(patternNode.asObject())
            this.nodeDict[patternNode.uuid] = patternNode;

            patternNode.attachTo(this.nodeLayer);

            patternNode.on('click', clickEvent => {
                this.onNodeClick(patternNode, clickEvent)
            })
            patternNode.on('pointerenter', mouseEvent => {
                this.onNodePointerEnter(patternNode, mouseEvent)
            })
            patternNode.on('pointerleave', mouseEvent => {
                this.onNodePointerLeave(patternNode, mouseEvent)
            })
            patternNode.on('contextmenu', mouseEvent => {
                this._onNodeContextMenu?.(patternNode, mouseEvent)
            })

            patternNode.renderElements?.root.call(
                d3.drag<SVGGElement, any>()
                    .on('start', () => {
                        this.dragStartNode = patternNode
                    })
                    .on('drag', this._onNodeDrag)
                    .on('end', this._onNodeDragEnd)
            )


            // this.editPayload = null;
            // this.nodeIndicator?.remove();
            // this.nodeIndicator = undefined;
        })

        Object.values(file.edges.entities).forEach(e => {
            if (!e) return;
            const fromNode = this.nodeDict[e.from]
            const toNode = this.nodeDict[e.to]
            // const edgeTypeName = this.model.getRelationNames(fromNode.ontologyClass, toNode.ontologyClass)[0].name
            const patternEdge = new PatternEdge(
                fromNode,
                toNode,
                true,
                e.id,
                [],
                e.class.name
            )
            this._onEdgeCreatedCallback?.(patternEdge.asObject())
            this.edgeDict[patternEdge.uuid] = patternEdge;

            patternEdge.attachTo(this.edgeLayer);
            patternEdge.on('click', clickEvent => {
                this.onEdgeClick(patternEdge, clickEvent)
            });
        })

        Object.values(file.constraints.entities).forEach(c => {
            this.notifyElementConstrained({
                ...file.nodes.entities[c!.targetId]!,
                type: VisualElementType.Node
            })
        })
    }
}
