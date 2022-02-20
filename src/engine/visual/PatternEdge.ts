import { EdgeDirection, IPatternEdge } from "../../utils/common/graph";
import { IVector } from "../../utils/common/layout";
import { CommonModel } from "../../utils/common/model";
import { Arrow } from "../elements/Arrow";
import { PatternNode } from "./PatternNode";
import { IFocusableElement, IVisualElement, VisualElementType } from "./VisualElement";

interface RenderElements {
    root: D3<SVGGElement>;
    arrow: Arrow;
    hoverArrow: Arrow;
    // labelText: D3<SVGTextElement>;
    // labelContainer: D3<SVGPathElement>;
}

export class PatternEdge implements IFocusableElement<VisualElementType.Edge> {
    public readonly elementType = VisualElementType.Edge;

    public from: PatternNode;
    public to: PatternNode;
    private isDirected: boolean;
    public uuid: string;

    protected renderElements?: RenderElements

    constructor(
        from: PatternNode,
        to: PatternNode,
        isDirected: boolean,
        id: string
    ) {
        this.from = from;
        this.to = to;
        this.isDirected = isDirected;
        this.uuid = id;
    }


    public get logicVector(): IVector {
        return {
            x: this.to.logicPosition.x - this.from.logicPosition.x,
            y: this.to.logicPosition.y - this.from.logicPosition.y
        }
    }

    public attachTo(
        parent: D3<SVGGElement>
    ) {
        const elementGroup = parent.append('g')
            .attr('class', 'p-e')
            .attr('edge-uuid', this.uuid);


        const arrow = new Arrow(this.from.logicPosition, this.to.logicPosition, 18, true);
        const hoverArrow = new Arrow(this.from.logicPosition, this.to.logicPosition, 18, true, 'hover');
        hoverArrow.attachTo(elementGroup);
        arrow.attachTo(elementGroup);
        arrow.renderElement?.root.attr('pointer-events', 'none')

        this.renderElements = {
            root: elementGroup,
            arrow,
            hoverArrow
        }
    }

    public on(eventName: string, listener: (event: any) => void) {
        return this.renderElements?.root.on(eventName, listener)
    }

    public getBoundingBox() {
        return {
            x: (this.from.logicPosition.x + this.to.logicPosition.x) / 2 - 12,
            y: (this.from.logicPosition.y + this.to.logicPosition.y) / 2 - 12,
            width: 24,
            height: 24
        }
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


    private _isDisabled = false;

    public setDisabled(value: boolean) {
        if (this._isDisabled !== value) {
            this._isDisabled = value;
            this.renderElements?.root.attr('disabled', value);
        }
    }
    public get isDisabled() { return this._isDisabled }

    public asObject(): IPatternEdge {
        return {
            id: this.uuid,
            from: this.from.uuid,
            to: this.to.uuid,
            class: {
                from: this.from.ontologyClass,
                to: this.to.ontologyClass,
                properties: [],
                name: `${this.from.ontologyClass.name}-->${this.to.ontologyClass.name}`,
                id: `${this.from.ontologyClass.id}-->${this.to.ontologyClass.id}`
            },
            direction: this.isDirected ? EdgeDirection.Specified : EdgeDirection.Unspecified,
            constraints: []
        }
    }
}