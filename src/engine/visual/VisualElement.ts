
export enum VisualElementType {
    Node,
    Edge,
}

export interface IVisualElement<T extends VisualElementType = VisualElementType> {
    elementType: T,
    asObject: () => any
}

export type IFocusableElement<T extends VisualElementType = VisualElementType> = IVisualElement<T> & {
    focus: (ev?: MouseEvent) => void,
    blur: (ev?: MouseEvent) => void,
}

// export function cast<T extends VisualElementType>(element: IVisualElement<T>, type: T): IVisualElement<0> | IVisualElement<1> { return element; }