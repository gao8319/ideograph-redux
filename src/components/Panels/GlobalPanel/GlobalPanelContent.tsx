import { nanoid, Update } from "@reduxjs/toolkit";
import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { lastConstraintOperationSelector } from "../../../store/slice/constraintSlicer";
import { IConstraint } from "../../../utils/common/graph";
import { PanelTitle } from "../common/PanelTitle";
import { Edge, Graph, Node } from '@antv/x6';
import { addLogicAndNode, addLogicNotNode, addLogicOrNode, createConstraintNode, createLogicComposingGraph, modifyConstraintNode } from "./X6Elements";
import { ActionButtonTiny } from "../common/ActionButton";
import { Add20, Search16 } from "@carbon/icons-react";
import { ClickAwayListener } from "@mui/material";
import { Callout, DirectionalHint } from "@fluentui/react";
import React from "react";
import { IConstraintContext, ILogicOperator } from "../../../utils/PatternContext";
import { BinaryLogicOperator, LogicOperator, UnaryLogicOperator } from "../../../utils/common/operator";
import { GlobalPanel } from "./GlobalPanel";
import _ from "lodash";
import { WorkspaceCommand } from "../../WorkspaceHeader/WorkspaceCommand";
import { applyQuery } from "../../../store/slice/modelSlicer";
import { createPortal } from "react-dom";
import { ideographDarkTheme } from "../../../utils/ideographTheme";

export interface IGlobalPanelContentRef {
    getConstraintContext: () => Omit<IConstraintContext, "constraints"> | null;
    // initialContext: IConstraintContext;
}

export interface IGlobalPanelContentProps {
    // getConstraintContext: () => Omit<IConstraintContext, "constraints"> | null;
    initialContext?: IConstraintContext;
}

const restoreContextGraph = (graph: Graph, context: IConstraintContext) => {
    const nodes = context.constraints.map(
        (constraint, i) => createConstraintNode(graph, constraint, { x: 16, y: 16 + 48 * i })
    );

    const logics = context.logicOperators.map(
        (op, i) => {
            switch (op.type) {
                case UnaryLogicOperator.Not: {
                    return addLogicNotNode(graph, op.id, { x: 240, y: 16 + 48 * i });
                }
                case BinaryLogicOperator.And: {
                    return addLogicAndNode(graph, op.id, { x: 240, y: 16 + 48 * i });
                }
                case BinaryLogicOperator.Or: {
                    return addLogicOrNode(graph, op.id, { x: 240, y: 16 + 48 * i });
                }
            }
        }
    )

    const nodeDict = _.keyBy(nodes.concat(logics), it => it.id)

    // graph.addEdges(
    //     context.connections.map(
    //         conn => {
    //             console.log(nodeDict[conn.from].ports, nodeDict[conn.to].ports)
    //             return {
    //                 sourcePort: nodeDict[conn.from].ports?.items[0]?.id,
    //                 targetPort: nodeDict[conn.to].ports?.items[0]?.id
    //             }
    //         }
    //     )
    // )

}

export const GlobalPanelContent = React.forwardRef<IGlobalPanelContentRef, IGlobalPanelContentProps>((props, ref) => {

    const lastConstraintOperation = useAppSelector(lastConstraintOperationSelector);
    const x6ContainerRef = useRef<HTMLDivElement>(null);
    const observedRef = useRef<HTMLDivElement>(null);
    const logicOperatorSet = useRef<Set<ILogicOperator>>();

    const x6Ref = useRef<Graph>();

    const nodeDictRef = useRef<Map<string, Node>>(new Map());

    const [contextMenuProps, setContextMenuProps] = useState<[MouseEvent, () => void]>();

    useEffect(() => {
        const container = x6ContainerRef.current;
        if (container) {
            const g = createLogicComposingGraph(container);
            x6Ref.current = g;
            logicOperatorSet.current = new Set();
            x6Ref.current.on("node:contextmenu", event => {
                setContextMenuProps(
                    [event.e as any as MouseEvent,
                    () => {
                        event.node.remove();
                    }]
                )
            })
            x6Ref.current.on("edge:contextmenu", event => {
                setContextMenuProps(
                    [event.e as any as MouseEvent,
                    () => {
                        event.edge.remove();
                    }]
                )
            })
            return () => {
                g?.dispose();
                x6Ref.current = undefined;
                logicOperatorSet.current?.clear();
                logicOperatorSet.current = undefined;
            }
        }
    }, [x6ContainerRef])

    useEffect(() => {
        if (x6Ref.current && props.initialContext) {
            restoreContextGraph(x6Ref.current, props.initialContext);
        }
    }, [props.initialContext, x6Ref])

    useEffect(
        () => {
            if (lastConstraintOperation && x6Ref.current) {
                switch (lastConstraintOperation.action) {
                    case "addOne": {
                        const p = lastConstraintOperation.payload.payload as IConstraint;
                        const n = createConstraintNode(x6Ref.current, p);
                        nodeDictRef.current?.set(p.id, n);
                        break;
                    }
                    case "removeOne": {
                        nodeDictRef.current?.get(lastConstraintOperation.payload.payload as string)?.remove();
                        break;
                    }
                    case "updateOne": {
                        const p = lastConstraintOperation.payload.payload as Update<IConstraint>;
                        const n = nodeDictRef.current?.get(p.id as string);
                        if (n) {
                            modifyConstraintNode(n, p);
                        }
                        break;
                    }
                }
            }
        }, [lastConstraintOperation, x6Ref]
    )

    const dispatch = useAppDispatch();

    useImperativeHandle(
        ref,
        () => ({
            getConstraintContext: () => {
                const x6 = x6Ref.current;
                if (x6 && logicOperatorSet.current) {
                    const conns = x6.getEdges().map(
                        e => {
                            return {
                                from: e.getSourceCellId(),
                                to: e.getTargetCellId(),
                            }
                        }
                    )
                    return {
                        logicOperators: [...logicOperatorSet.current],
                        connections: conns
                    }
                }
                return null;
            }
        }),
        [x6Ref, logicOperatorSet])

    const [logicOperatorMenuOpen, setLogicOperatorMenuOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);


    useEffect(() => {
        if (x6Ref.current && observedRef.current) {
            const ro = new ResizeObserver(_.debounce(rects => {
                x6Ref.current?.resize(
                    rects[0].contentRect.width,
                    rects[0].contentRect.height,
                )

            }, 200))
            ro.observe(observedRef.current)
            return () => {
                observedRef.current && ro.unobserve(observedRef.current)
            }
        }
    }, [x6Ref])

    return <GlobalPanel>

        <PanelTitle text="全局逻辑">
            {/* <ClickAwayListener onClickAway={ev => { setLogicOperatorMenuOpen(false) }}> */}
            <div style={{ display: 'flex', columnGap: 8, fontSize: 13, alignItems: 'center' }}>
                <span style={{ color: 'var(--grey200)', paddingRight: 8, fontWeight: 400 }}>添加逻辑运算</span>
                <ActionButtonTiny
                    disableRipple
                    ref={buttonRef}
                    onClick={
                        ev => {
                            const newAndOperator: ILogicOperator = {
                                type: BinaryLogicOperator.And,
                                id: nanoid(),
                            }
                            logicOperatorSet.current?.add(newAndOperator)
                            x6Ref.current && addLogicAndNode(x6Ref.current, newAndOperator.id);
                            setLogicOperatorMenuOpen(false)
                        }
                    }
                    style={{ fontSize: 13, fontWeight: 600 }}>
                    与
                </ActionButtonTiny>

                <ActionButtonTiny
                    disableRipple
                    ref={buttonRef}
                    onClick={
                        ev => {
                            const newOrOperator: ILogicOperator = {
                                type: BinaryLogicOperator.Or,
                                id: nanoid(),
                            }
                            logicOperatorSet.current?.add(newOrOperator);
                            x6Ref.current && addLogicOrNode(x6Ref.current, newOrOperator.id);
                            setLogicOperatorMenuOpen(false)
                        }
                    }
                    style={{ fontSize: 13, fontWeight: 600 }}>
                    或
                </ActionButtonTiny>
                <ActionButtonTiny
                    disableRipple
                    ref={buttonRef}
                    onClick={
                        ev => {
                            const newNotOperator: ILogicOperator = {
                                type: UnaryLogicOperator.Not,
                                id: nanoid(),
                            }
                            logicOperatorSet.current?.add(newNotOperator);
                            x6Ref.current && addLogicNotNode(x6Ref.current, newNotOperator.id);
                            setLogicOperatorMenuOpen(false)
                        }
                    }
                    style={{ fontSize: 13, fontWeight: 600 }}>
                    非
                </ActionButtonTiny>
            </div>
            {/* </ClickAwayListener> */}
        </PanelTitle>
        <div className="constraint-pool-root" ref={observedRef}>
            <div className="x6-container" ref={x6ContainerRef} />
        </div>
        <div style={{ display: 'flex', columnGap: 8, position: 'absolute', right: 8, bottom: 8, width: '100%', justifyContent: 'flex-end' }}>

            {/* <WorkspaceCommand activated={false}
            // hint='匹配查询'
            // shortcut=' Enter'
            // cmd
            autoLength
            forcedHighlight
            text='保存'
            style={{ color: '#fff', marginRight: 8, padding: '0 24px', }}
            onClick={_ => dispatch(applyQuery(true))}>
            {/* <Search16 fill="#fff" /> 
        </WorkspaceCommand> */}
            <WorkspaceCommand activated={false}
                hint='匹配查询'
                shortcut=' Enter'
                cmd
                autoLength
                forcedHighlight
                text='查询'
                style={{ color: '#fff', marginRight: 8, padding: '0 24px', }}
                onClick={_ => dispatch(applyQuery(true))}>
                <Search16 fill="#fff" />
            </WorkspaceCommand>
        </div>

        <Callout
            target={buttonRef.current}
            isBeakVisible={false}
            hidden //</GlobalPanel>={!logicOperatorMenuOpen}
            styles={{
                calloutMain: {
                    borderRadius: 0,
                    minWidth: 120,
                }
            }}
            directionalHint={DirectionalHint.bottomRightEdge}
        >
            <div style={{ background: '#212224', padding: '8px 1px', borderRadius: 0, maxHeight: '90vh', overflow: 'auto' }}>
                <li
                    className="contextual-menu-item"
                    onClick={ev => {
                        const newAndOperator: ILogicOperator = {
                            type: BinaryLogicOperator.And,
                            id: nanoid(),
                        }
                        logicOperatorSet.current?.add(newAndOperator)
                        if (x6Ref.current) {
                            const node = addLogicAndNode(x6Ref.current, newAndOperator.id);
                            // node.
                        }
                        setLogicOperatorMenuOpen(false)
                    }}>
                    <span>与</span>
                    <span style={{ opacity: 0.25 }} className="shimmed">A</span>
                </li>
                <li
                    className="contextual-menu-item"
                    style={{}}
                    onClick={ev => {
                        const newOrOperator: ILogicOperator = {
                            type: BinaryLogicOperator.Or,
                            id: nanoid(),
                        }
                        logicOperatorSet.current?.add(newOrOperator);
                        x6Ref.current && addLogicOrNode(x6Ref.current, newOrOperator.id);
                        setLogicOperatorMenuOpen(false)
                    }}>
                    <span>或</span>
                    <span style={{ opacity: 0.25 }} className="shimmed">O</span>
                </li>
                <div style={{ height: 1, margin: '8px 0', background: '#313235' }} />
                <li
                    className="contextual-menu-item"
                    style={{}}
                    onClick={ev => {
                        const newNotOperator: ILogicOperator = {
                            type: UnaryLogicOperator.Not,
                            id: nanoid(),
                        }
                        logicOperatorSet.current?.add(newNotOperator);
                        x6Ref.current && addLogicNotNode(x6Ref.current, newNotOperator.id);
                        setLogicOperatorMenuOpen(false)
                    }}>
                    <span>非</span>
                    <span style={{ opacity: 0.25 }} className="shimmed">N</span>
                </li>
            </div>


        </Callout>

        {
            contextMenuProps && createPortal(
                <Callout
                    target={contextMenuProps[0]}
                    directionalHint={DirectionalHint.bottomLeftEdge}
                    onDismiss={ev => setContextMenuProps(undefined)}
                    theme={ideographDarkTheme}
                    beakWidth={0}
                    calloutMaxWidth={320}
                    styles={{
                        calloutMain: {
                            borderRadius: 0,
                            padding: '8px 0'
                        }
                    }}>
                    <div className='contextual-callout-item' onClick={ev => {
                        contextMenuProps[1]()
                        setContextMenuProps(undefined)
                    }}>
                        <div style={{ fontSize: 13 }}>移除</div>
                    </div>
                </Callout>,
                document.body
            )
        }

    </GlobalPanel>
})