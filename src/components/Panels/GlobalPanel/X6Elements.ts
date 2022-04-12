import { Graph, Path, Shape, Node } from '@antv/x6';
import { Update } from '@reduxjs/toolkit';
import { IConstraint } from '../../../utils/common/graph';
import { IPoint } from '../../../utils/common/layout';
import { isNotEmpty } from '../../../utils/common/utils';
import { operatorLiteral } from '../../ConstraintsEditor/ConstraintField';

const portItems2_1 = (width?: number) => [{
    id: 'out_1',
    group: 'group1',
    args: {
        x: width ?? 192,
        y: 14,
    },
}, {
    id: 'in_1',
    group: 'group2',
    args: {
        x: 0,
        y: 8,
    },
}, {
    id: 'in_2',
    group: 'group2',
    args: {
        x: 0,
        y: 20,
    },
}];
const portItems1_1 = (width?: number) => [{
    id: 'out_1',
    group: 'group1',
    args: {
        x: width ?? 192,
        y: 14,
    },
}, {
    id: 'in_1',
    group: 'group2',
    args: {
        x: 0,
        y: 14,
    },
}];

export const addLogicNode = (
    graph: Graph,
    text: string,
    id: string,
    nIn: number = 2,
    nOut: number = 1,
    primary: string,
    background: string,
    width: number,
    position?: IPoint
) => graph.addNode({
    width: width ?? 192,
    height: 28,
    x: 240,
    y: 16,
    ...position,
    label: text,
    id,
    attrs: {
        label: {
            refX: 8,
            refY: 15,
            textAnchor: 'start',
            textVerticalAnchor: 'middle',
            fontFamily: 'var(--mono-font)',
            fontFeatureSetting: '"liga" 1',
            fill: primary ?? '#000',
            fontWeight: 600,
        },
        body: {
            stroke: primary ?? '#919297',
            fill: background ?? '#fff',
            strokeWidth: 2,
            rx: 4,
            ry: 4,
        }
    },
    ports: {
        groups: {
            group1: {
                attrs: {
                    circle: {
                        r: 4,
                        magnet: true,
                        stroke: primary ?? '#919297',
                        strokeWidth: 2,
                        fill: '#fff',
                    },
                },
                position: {
                    name: 'absolute',
                },
            },
            group2: {
                attrs: {
                    circle: {
                        r: 4,
                        magnet: true,
                        stroke: primary ?? '#919297',
                        strokeWidth: 2,
                        fill: '#fff',
                    },
                },
                position: {
                    name: 'absolute',
                },
            }
        },
        items: nIn === 1 ? portItems1_1(width) : portItems2_1(width),
    }
})

export const addLogicAndNode = (graph: Graph, id: string, position?: IPoint) => addLogicNode(graph, "与", id, 2, 1, '#EF6C00', '#FFF8E1', 64, position);
export const addLogicOrNode = (graph: Graph, id: string, position?: IPoint) => addLogicNode(graph, "或", id, 2, 1, '#0277BD', '#E1F5FE', 64, position);
export const addLogicNotNode = (graph: Graph, id: string, position?: IPoint) => addLogicNode(graph, "非", id, 1, 1, '#512DA8', '#EDE7F6', 64, position);


const registerBumpXConnector = () => {
    Graph.registerConnector(
        'bumpx',
        (s, e) => {
            const offset = 4
            const deltaY = Math.abs(e.y - s.y)
            const control = Math.floor((deltaY / 3) * 2)

            const v1 = { x: s.x, y: s.y + offset + control }
            const v2 = { x: e.x, y: e.y - offset - control }
            return Path.normalize(
                `M ${s.x} ${s.y}
             L ${s.x} ${s.y + offset}
             C ${v1.x} ${v1.y} ${v2.x} ${v2.y} ${e.x} ${e.y - offset}
             L ${e.x} ${e.y}
            `,
            )
        },
        true,
    )
}


export const createLogicComposingGraph = (container: HTMLDivElement) => new Graph({
    container,
    grid: 16,
    connecting: {
        allowLoop: false,
        allowMulti: false,
        allowEdge: false,
        allowNode: false,
        allowPort: true,
        router: {
            name: 'manhattan',
            args: {
                padding: 16,
            },
        },
        connector: {
            name: 'rounded',
            args: {
                radius: 8,
            },
        },
        anchor: 'center',
        connectionPoint: 'anchor',
        allowBlank: false,
        createEdge() {
            return new Shape.Edge({
                attrs: {
                    line: {
                        stroke: '#919297',
                        strokeWidth: 2,
                        targetMarker: {
                            name: 'block',
                            width: 12,
                            height: 8,
                        },
                    },
                },
                zIndex: 0,
            })
        },
        validateConnection(args) {
            if (args?.sourceCell?.id && args?.targetCell?.id) {
                console.log(args.sourceCell.id, args.targetCell.id)
            }
            return !!args.targetMagnet
        },
    },
})

const getTextedNodeLable = (s: string) => ({
    refX: 8,
    refY: 15,
    textAnchor: 'start',
    textVerticalAnchor: 'middle',
    fontFamily: 'var(--mono-font)',
    fontFeatureSetting: '"liga" 1',
    text: s
});

const describeConstraint = (c: IConstraint | Update<IConstraint>) => {
    // @ts-ignore
    if (c.changes) {
        //@ts-ignore
        const ic = c.changes as IConstraint
        if ((ic.expression || ic.property) && isNotEmpty(ic.operator) && isNotEmpty(ic.value))
            return `${ic.expression ?? ic.property?.name} ${operatorLiteral[ic.operator ?? 0]} ${ic.value}`;
        return ""
    }
    //@ts-ignore
    else {         //@ts-ignore
        const ic = c as IConstraint
        if ((ic.expression || ic.property) && ic.operator && ic.value)
            return `${ic.expression ?? ic.property?.name} ${operatorLiteral[ic.operator ?? 0]} ${ic.value}`;
        return ""
    }
}

export const createConstraintNode = (g: Graph, c: IConstraint, position?: IPoint) => {
    // console.log(c);
    return g.addNode(
        {
            data: {
                labelText: "",
            },
            id: c.id,
            width: 192,
            height: 28,
            x: 16,
            y: 16,
            ...position,
            attrs: {
                label: getTextedNodeLable(describeConstraint(c)),
                body: {
                    stroke: '#e1e2e5',
                    fill: '#fff',
                    strokeWidth: 1,
                    rx: 4,
                    ry: 4,
                }
            },
            ports: {
                groups: {
                    group1: {
                        attrs: {
                            circle: {
                                r: 4,
                                magnet: true,
                                stroke: '#919297',
                                strokeWidth: 2,
                                fill: '#fff',
                            },
                            text: {
                                fontSize: 12,
                                fill: '#888',
                            },
                        },
                        // 文档：https://x6.antv.vision/zh/docs/api/registry/port-layout#absolute
                        position: {
                            name: 'absolute',
                        },
                    }
                },
                items: [{
                    id: 'out_1',
                    group: 'group1',
                    args: {
                        x: 192,
                        y: 14,
                    },
                }],
            }
        }
    )
}


export const removeConstraintNode = (g: Graph, cid: IConstraint['id']) => {

    g.removeNode(cid)
}

export const modifyConstraintNode = (n: Node, c: Update<IConstraint>) => {

    const text = describeConstraint(c)

    n.replaceAttrs(
        {
            label: getTextedNodeLable(text),
        }
    )
}