type ILinkedTree<T> = {
    children?: ILinkedTree<T>[],
    // parent: ITree<T>,
} & T

type IIdentifiableTree<T, K extends PropertyKey> = {
    children?: K[],
    index: K,
    // parent: ITree<T>,
} & T

export const flattenTree = <T>(node: ILinkedTree<T>): T[] => {
    const curr = node //_.omit(node, 'children')
    if (node.children && node.children.length > 0) {
        return [curr as any, ...node.children.map(flattenTree)]
    }
    else
        return [curr as any]
}

// assuming the first is the root
const attachNode = <T, K extends PropertyKey>
    (node: IIdentifiableTree<T, K>, nodeDict: Record<PropertyKey, T>)
    : ILinkedTree<T> => {
    const n: ILinkedTree<T> = { ...node, children: (node).children?.map(id => nodeDict[id]) }
    return n;
}

const buildTree = <T, K extends PropertyKey>
    (nodes: IIdentifiableTree<T, K>[])
    : ILinkedTree<T> => {

    const nodeDict: Record<PropertyKey, T> = Object.fromEntries(nodes.map(it => [it.index, it]))

    const n: ILinkedTree<T> = { ...nodes[0], children: (nodes[0]).children?.map(id => nodeDict[id]) }
    return n;
}