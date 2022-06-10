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
import { PatternGroup } from "./visual/PatternGroup";
import { ElementType } from "@fluentui/react";


export enum RaiseMessageType {
    Error,
    Warning,
    Success,
}

export type RaiseMessageCallback = (message: string, type: RaiseMessageType, asInnerHtml?: boolean) => void;

export class PatternGraphEngine {

    // TODO: Inject History Manager
    /**
     * 本体模型
     */
    public readonly model: CommonModel.Root
    // public colorSlots: Record<string, ColorSlot>

    /**
     * 编辑器状态
     */
    private _editMode = EditMode.Default;
    public get editMode(): EditMode {
        return this._editMode;
    }
    public set editMode(e: EditMode) {

        if (this._editMode === e) return;
        this._editMode = e;

        // 把编辑状态产生的 指示器全都清理掉
        this.mouseIndicatorLayer?.attr('transform', 'translate(0,0)');
        this.mouseIndicatorLayer?.selectChildren('*').remove();
        this.nodeIndicator = undefined;
        this.connectionIndicator = undefined;

        /**
         * 在创建边的过程中，元素的样式会发生改变，
         * 这里把样式复原
         */
        Object.values(this.nodeDict).forEach(_n => _n.setDisabled(false))
        Object.values(this.edgeDict).forEach(_n => _n.setDisabled(false))
        Object.values(this.groupDict).forEach(_n => _n.setDisabled(false))
    }
    public editPayload: string | number | null = null


    public renderContainer: HTMLDivElement
    public svgLayer: D3<SVGSVGElement>
    public nodeLayer: D3<SVGGElement>
    public edgeLayer: D3<SVGGElement>
    public groupLayer: D3<SVGGElement>

    


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

        this.clearElementSelection();

        if (this._focusedElement === e) return;

        this._focusedElementChangedCallback?.(e, this._focusedElement);

        this._focusedElement?.blur();
        e?.focus();
        this._focusedElement = e;
    }


    /**
     * 多选的元素集合
     */
    private _elementSelection = new Set<IFocusableElement>();
    private _addElementToSelection(ele: IFocusableElement) {
        if (this._focusedElement) {
            this._elementSelection.add(this._focusedElement);

            this._focusedElement = null;
        }
        this._elementSelection.add(ele);
        ele.focus();
    }
    private _removeElementFromSelection(ele: IFocusableElement) {
        ele.blur();
        this._elementSelection.delete(ele);
    }
    public toggleElementSelection(ele: IFocusableElement) {
        if (this._elementSelection.has(ele)) {
            this._removeElementFromSelection(ele);
        }
        else {
            this._addElementToSelection(ele);
        }
    }
    public clearElementSelection() {
        this._elementSelection.forEach(ele => {
            ele.blur();
        })
        this._elementSelection = new Set<IFocusableElement>();
    }


    /**
     * 一些事件的回调，通过这里可以把 React/Vue 框架里的回调注入进来
     */

    private _onNodeContextMenu?: (n: PatternNode, event: MouseEvent) => void;
    private _onEdgeContextMenu?: (n: PatternEdge, event: MouseEvent) => void;
    private _onSelectionContextMenu?: (
        set: Set<IFocusableElement>,
        firedAt: IFocusableElement,
        event: MouseEvent
    ) => void;
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
    public setOnEdgeContextMenu = (cb: typeof this._onEdgeContextMenu) => { this._onEdgeContextMenu = cb; }
    public setOnSelectionContextMenu = (cb: typeof this._onSelectionContextMenu) => { this._onSelectionContextMenu = cb; }
    public setOnEdgeSelectTypeCallback = (cb: typeof this._onEdgeSelectTypeCallback) => { this._onEdgeSelectTypeCallback = cb; }

    public notifyElementConstrained(ele: (IPatternNode | IPatternEdge) & {
        type: VisualElementType;
    }, isConstrained = true) {
        if (ele.type === VisualElementType.Node) {
            this.nodeDict[ele.id].isConstrained = isConstrained;
        } else if (ele.type === VisualElementType.Edge) {
            this.edgeDict[ele.id].isConstrained = isConstrained;
        }
    }

    public deleteElement = (ele: IPatternEdge | IPatternNode) => {
        const node = this.nodeDict[ele.id]
        if (node) {
            this.focusedElement = null;
            node.detach();
            Object.keys(this.edgeDict).forEach(ek => {
                const e = this.edgeDict[ek]
                if (e?.from.uuid === node.uuid) {
                    e.detach();
                    delete this.edgeDict[e.uuid]
                }
                else if (e?.to.uuid === node.uuid) {
                    e.detach();
                    delete this.edgeDict[e.uuid]
                }
            })
            delete this.nodeDict[ele.id];

        }
        else {
            this.focusedElement = null;
            const edge = this.edgeDict[ele.id];
            edge.detach();
            delete this.edgeDict[ele.id]
        }
    }

    public modifyAlias(alias: string | undefined, id: string) {
        this.nodeDict[id].setAlias(alias, this.zoomTransform?.k ?? 1)
    }
    private nodeDict: Dictionary<PatternNode> = {};
    private edgeDict: Dictionary<PatternEdge> = {};
    private groupDict: Dictionary<PatternGroup> = {};

    /**
     * 画布的缩放， 参见 d3-zoom
     * zoom 的时候是 3 个 layer 一起 zoom
     */
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

        this.groupLayer = this.svgLayer.append('g')
            .attr('class', 'engine-core')

        this.edgeLayer = this.svgLayer.append('g')
            .attr('class', 'engine-core')
        this.nodeLayer = this.svgLayer.append('g')
            .attr('class', 'engine-core')

        const mouseRoot = d3.select(document.body)
            .append('svg')
            .classed('mouse-layer', true)
            .append('g');

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
                    this.groupLayer.attr('transform', t)
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

    /**
     * 回收整个 PatternGraphEngine 在 html 上画的东西
     */
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

                        n.attachTo(this.nodeLayer, this.zoomTransform?.k ?? 1);
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
                            if (this._elementSelection.size > 0) {
                                if (this._elementSelection.has(n)) {
                                    this._onSelectionContextMenu?.(this._elementSelection, n, mouseEvent);
                                }
                                else {
                                    this.focusedElement = n;
                                    this._onNodeContextMenu?.(n, mouseEvent)
                                }
                            }
                            else {
                                this._onNodeContextMenu?.(n, mouseEvent)
                            }
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
                Object.values(this.groupDict).forEach(_n => _n.setDisabled(false))
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
            Object.values(this.groupDict).forEach(_n => _n.setDisabled(true))
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
                                e.on('contextmenu', ev => {
                                    this._onEdgeContextMenu?.(e, ev);
                                })
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

                                    e.on('contextmenu', ev => {
                                        this._onEdgeContextMenu?.(e, ev);
                                    })
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

                            e.on('contextmenu', ev => {
                                this._onEdgeContextMenu?.(e, ev);
                            })
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
            Object.values(this.groupDict).forEach(_n => _n.setDisabled(false))

            this.focusedElement = null;
            this.createEdgeFrom = null;
            this.mouseHoveringAtNode = null;
            this.editMode = EditMode.CreatingEdgeFrom;
        }
        else {
            if (ev.metaKey) {
                this.toggleElementSelection(n);
            }
            else {
                this.focusedElement = n;
            }
        }
        ev.stopPropagation();
    }


    /**
     * 鼠标 hover 在哪个 node 上
     */
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

    /**
     * 点击边，
     * 
     * @param e 
     * @param ev 
     */
    private onEdgeClick = (e: PatternEdge, ev: MouseEvent) => {
        if (this.editMode >= 2) {
            this.createEdgeFrom = null;
            this.editMode = EditMode.CreatingEdgeFrom;
        }
        if (ev.metaKey) {
            // 多选
            this.toggleElementSelection(e);
        }
        else {
            // 单选，获取焦点
            this.focusedElement = e;
        }
        ev.stopPropagation();
    }

    /**
     * 拖拽的起始 node，没在拖拽为空
     */
    private dragStartNode?: PatternNode;
    /**
     * 正在拖拽
     */
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
                    Object.values(this.groupDict).forEach(_n => _n.setDisabled(true));
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
                        this.connectionIndicator.modifyEndpoint(ev)
                        this.connectionIndicator
                            .attr('stroke-dasharray', '8, 8');
                    }
                }


            }
        }
    }


    /**
     * 鼠标拖拽到 node 上的回调
     * @param ev 
     */
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
                        const t = transformed ? {
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

                                e.on('contextmenu', ev => {
                                    this._onEdgeContextMenu?.(e, ev);
                                })
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

                        e.on('contextmenu', ev => {
                            this._onEdgeContextMenu?.(e, ev);
                        })
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




    /**
     * 从历史查询（JSON）中恢复整个画布
     * @param file 
     */
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

            patternNode.attachTo(this.nodeLayer,  this.zoomTransform?.k ?? 1);

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

                if (this._elementSelection.size > 0) {
                    if (this._elementSelection.has(patternNode)) {
                        this._onSelectionContextMenu?.(this._elementSelection, patternNode, mouseEvent);
                    }
                    else {
                        this.focusedElement = patternNode;
                        this._onNodeContextMenu?.(patternNode, mouseEvent)
                    }
                }
                else {
                    this._onNodeContextMenu?.(patternNode, mouseEvent)
                }
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

            patternEdge.on('contextmenu', ev => {
                this._onEdgeContextMenu?.(patternEdge, ev);
            })
        })

        Object.values(file.constraints.entities).forEach(c => {
            this.notifyElementConstrained({
                ...file.nodes.entities[c!.targetId]!,
                type: VisualElementType.Node
            })
        })
    }


    /**
     * 把多选的 nodes 和 edges 编组
     * @param multiplier 编组之后 这个子图 在最终结果中需要重复出现的次数
     */
    public aggregateSelection(multiplier?: number) {
        const group = new PatternGroup(nanoid(), this._elementSelection as Set<PatternEdge | PatternNode>);
        this._elementSelection.forEach(ele => {
            if (ele.elementType == VisualElementType.Node) {
                delete this.nodeDict[(ele as PatternNode).uuid]
            }
            else if (ele.elementType == VisualElementType.Edge) {
                delete this.edgeDict[(ele as PatternEdge).uuid]
            }
        })
        this.groupDict[group.uuid] = group;
        group.attachTo(this.groupLayer);
        group.setMultiplier(multiplier);
        group.on('click', () => {
            this.focusedElement = group;
        })
        this.clearElementSelection();
    }

    /**
     * 打破一个编组
     * @param uuid 
     */
    public breakGroup(uuid: string) {
        const breaked = this.groupDict[uuid].break();
        breaked.forEach(ele => {
            if (ele.elementType == VisualElementType.Node) {
                this.nodeDict[ele.uuid] = ele;
            }
            else if (ele.elementType == VisualElementType.Edge) {
                this.edgeDict[ele.uuid] = ele;
            }
        })
    }

    /**
     * 获取编辑的数据结构，交给 PatternContext 算出要给后端的结构
     * @returns 
     */
    public generatePatternGraphContext() {
        return {
            nodes: this.nodeDict,
            edges: this.edgeDict,
            groups: this.groupDict,
        }
    }
}
