import { IFocusableElement, VisualElementType } from "./VisualElement";
import './PatternNode.css'
import { PatternEdge } from "./PatternEdge";
import { IPoint } from "../../utils/common/layout";
import { CommonModel } from "../../utils/common/model";
import { IPatternNode } from "../../utils/common/graph";

interface RenderElements {
    root: D3<SVGGElement>;
    ring: D3<SVGCircleElement>;
    circle: D3<SVGCircleElement>;
    aliasText: D3<SVGTextElement>;
    typeText: D3<SVGTextElement>;
    selection: D3<SVGCircleElement>;
    aliasContainer: D3<SVGRectElement>;
}

export class PatternNode implements IFocusableElement<VisualElementType.Node> {
    public readonly elementType = VisualElementType.Node;

    public connections: PatternEdge[] = []
    public _alias?: string;
    public get alias() { return this._alias }

    public setAlias(value: string | undefined, scale: number) {
        this._alias = value;
        if (value !== undefined) {
            this.renderElements?.root.attr('aliased', true);
            const aliasTextString = this.getRenderedAlias(value)
            if (this.renderElements) {
                this.renderElements.aliasText.text(aliasTextString)
                if (aliasTextString.length > 0) {
                    const aliasWidth = (this.renderElements.aliasText.node()?.getBoundingClientRect().width ?? 0) / scale;
                    const typeWidth = (this.renderElements.typeText.node()?.getBoundingClientRect().width ?? 0) / scale;
                    this.renderElements.typeText.attr('x', -(typeWidth + aliasWidth + 12) / 2)
                    this.renderElements.aliasText.attr('x', -(typeWidth + aliasWidth + 12) / 2 + typeWidth + 8)
                    this.renderElements.aliasContainer.attr('width', aliasTextString.length > 0 ? (aliasWidth + 12) : 0)
                        .attr('x', -(typeWidth + aliasWidth + 12) / 2 + typeWidth + 2)
                }
                else {
                    const typeWidth = (this.renderElements.typeText.node()?.getBoundingClientRect().width ?? 0) / scale;
                    this.renderElements.typeText.attr('x', -typeWidth / 2)
                    this.renderElements.aliasContainer.attr('width', 0)
                }
            }
        }
        else {
            this.renderElements?.root.attr('aliased', false);
        }
    }
    public ontologyClass: CommonModel.IColoredClass
    public readonly uuid: string
    public logicPosition: IPoint

    // private constraints: Map<string, Constraint> = new Map();

    public renderElements?: RenderElements

    constructor(
        ontologyClass: CommonModel.IColoredClass,
        position: IPoint,
        id: string,
        alias?: string
    ) {
        this.ontologyClass = ontologyClass;
        this.logicPosition = position;
        this.uuid = id;
        this._alias = alias;
    }

    static deserializeFromJSON(json: JSON) {

    }

    public getRenderedAlias(alias: string) {
        if (alias.startsWith(this.ontologyClass.name)) {
            return alias.replace(this.ontologyClass.name, '')
        }
        return alias
    }

    public attachTo(
        parent: D3<SVGGElement>,
        scale: number
    ) {
        const elementGroup = parent.append('g')
            .attr('class', 'p-n')
            .attr('node-uuid', this.uuid)
            .attr('transform', `translate(${this.logicPosition.x}, ${this.logicPosition.y})`);

        // elementGroup.node()?.setAttribute('draggable', 'true')

        const selection = elementGroup.append('circle')
            .attr('class', 'selection')

        const circle = elementGroup.append('circle')
            .attr('class', 'node')
            .attr('r', 12)
            .attr('fill', this.ontologyClass.colorSlot.primary)

        // circle.node()?.setAttribute('draggable', 'true')

        const ring = elementGroup.append('circle')
            .attr('class', 'constrain-ring')
            .attr('r', 15)
            .attr('stroke', this.ontologyClass.colorSlot.constrained)

        const aliasContainer = elementGroup.append('rect')
            .attr('class', 'alias-rect')
            .attr('y', 16)
            .attr('height', 16)
            .attr('rx', 8)
            .attr('ry', 8)
            .attr('fill', 'transparent')
            .attr('stroke', this.ontologyClass.colorSlot.darkened)
            .attr('stroke-width', 1.25)

        const aliasTextString = this.alias ? this.getRenderedAlias(this.alias) : ''
        const aliasText = elementGroup.append('text')
            .attr('class', 'alias')
            .attr('y', 24)
            .attr('fill', this.ontologyClass.colorSlot.darkened)
            .attr('font-weight', 700)
            .text(aliasTextString)

        const typeText = elementGroup.append('text')
            .attr('class', 'type')
            .attr('y', 24)
            .attr('fill', this.ontologyClass.colorSlot.darkened)
            .text(this.ontologyClass.name)

        if (aliasTextString.length > 0) {
            const aliasWidth = (aliasText.node()?.getBoundingClientRect().width ?? 0) / scale;
            const typeWidth = (typeText.node()?.getBoundingClientRect().width ?? 0) / scale;

            typeText.attr('x', -(typeWidth + aliasWidth + 12) / 2)
            aliasText.attr('x', -(typeWidth + aliasWidth + 12) / 2 + typeWidth + 8)
            aliasContainer.attr('width', aliasTextString.length > 0 ? (aliasWidth + 12) : 0)
                .attr('x', -(typeWidth + aliasWidth + 12) / 2 + typeWidth + 2)
        }
        else {
            const typeWidth = (typeText.node()?.getBoundingClientRect().width ?? 0) / scale;
            typeText.attr('x', -typeWidth / 2)
        }

        elementGroup.attr('aliased', Boolean(this._alias));

        this.renderElements = {
            root: elementGroup,
            ring,
            circle,
            aliasText,
            typeText,
            selection,
            aliasContainer
        }
    }

    public detach() {
        this.renderElements?.root.attr('opacity', 1).transition().attr('opacity', 0).duration(600).remove();
    }

    public getBoundingBox() {
        return this.renderElements?.root?.node()?.getBoundingClientRect();
    }

    public on(eventName: string, listener: (event: any) => void) {
        return this.renderElements?.root.on(eventName, listener)
    }


    private _isFocused = false;
    public focus = () => {
        this.renderElements?.root.attr('focused', true);
        this._isFocused = true;
    }
    public blur = () => {
        this.renderElements?.root.attr('focused', false);
        this._isFocused = false;
    }
    public get isFocused() { return this._isFocused }


    private _isConstrained = false;
    // protected get isConstrained() {
    //     return this._isConstrained
    // }
    public set isConstrained(v: boolean) {
        if (v != this.isConstrained) {
            this._isConstrained = v;
            this.renderElements?.root.attr('constrained', v);
        }
    }

    public get isConstrained() {
        return this._isConstrained;
    }

    // public setConstraint<T extends PrimitiveTypeName>(id: string, constraint: Constraint<T>) {
    //     this.constraints.set(id, constraint);
    //     this.isConstrained = true;
    // }

    // public removeConstraints(constraintUuid: string) {
    //     this.constraints.delete(constraintUuid);
    //     if (this.constraints.size === 0) {
    //         this.isConstrained = false;
    //     }
    // }

    // public resetConstraints() {
    //     this.constraints.clear();
    //     this.isConstrained = false;
    // }

    // public getConstraints(constraintUuid: string) {
    //     return this.constraints.get(constraintUuid);
    // }

    // public getAllConstraints() {
    //     return this.constraints;
    // }


    public asObject(): IPatternNode {
        return {
            id: this.uuid,
            constraints: [],
            position: this.logicPosition,
            class: this.ontologyClass,
            alias: this._alias
        }
    }


    private _isDisabled = false;
    public setDisabled(disabled: boolean) {
        if (this._isDisabled !== disabled) {
            this._isDisabled = disabled;
            if (disabled) {
                this.renderElements?.root.attr('disabled', true);
            }
            else {
                this.renderElements?.root.attr('disabled', false);
            }
        }
    }


    public getDisabled() {
        return this._isDisabled;
    }
}