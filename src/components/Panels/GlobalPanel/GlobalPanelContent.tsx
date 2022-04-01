import { nanoid, Update } from "@reduxjs/toolkit";
import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { useAppSelector } from "../../../store/hooks";
import { lastConstraintOperationSelector } from "../../../store/slice/constraintSlicer";
import { IConstraint } from "../../../utils/common/graph";
import { PanelTitle } from "../common/PanelTitle";
import { Edge, Graph, Node } from '@antv/x6';
import { addLogicAndNode, addLogicNotNode, addLogicOrNode, createConstraintNode, createLogicComposingGraph, modifyConstraintNode } from "./X6Elements";
import { ActionButtonTiny } from "../common/ActionButton";
import { Add20 } from "@carbon/icons-react";
import { ClickAwayListener } from "@mui/material";
import { Callout, DirectionalHint } from "@fluentui/react";
import React from "react";
import { IConstraintContext, ILogicOperator } from "../../../utils/PatternContext";
import { BinaryLogicOperator, LogicOperator, UnaryLogicOperator } from "../../../utils/common/operator";
import { GlobalPanel } from "./GlobalPanel";
import _ from "lodash";

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
        constraint => createConstraintNode(graph, constraint)
    );

    const logics = context.logicOperators.map(
        op => {
            switch (op.type) {
                case UnaryLogicOperator.Not: {
                    return addLogicNotNode(graph, op.id);
                }
                case BinaryLogicOperator.And: {
                    return addLogicAndNode(graph, op.id);
                }
                case BinaryLogicOperator.Or: {
                    return addLogicOrNode(graph, op.id);
                }
            }
        }
    )

    const nodeDict = _.keyBy(nodes.concat(logics), it => it.id)

    graph.addEdges(
        context.connections.map(
            conn => {
                console.log(nodeDict[conn.from].ports, nodeDict[conn.to].ports)
                return {
                    sourcePort: nodeDict[conn.from].ports.items[0].id,
                    targetPort: nodeDict[conn.to].ports.items[0].id
                }
            }
        )
    )

}

export const GlobalPanelContent = React.forwardRef<IGlobalPanelContentRef, IGlobalPanelContentProps>((props, ref) => {

    const lastConstraintOperation = useAppSelector(lastConstraintOperationSelector);
    const x6ContainerRef = useRef<HTMLDivElement>(null);
    const observedRef = useRef<HTMLDivElement>(null);
    const logicOperatorSet = useRef<Set<ILogicOperator>>();

    const x6Ref = useRef<Graph>();

    const nodeDictRef = useRef<Map<string, Node>>(new Map());

    useEffect(() => {
        const container = x6ContainerRef.current;
        if (container) {
            const g = createLogicComposingGraph(container);
            x6Ref.current = g;
            logicOperatorSet.current = new Set();
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
            <ClickAwayListener onClickAway={ev => { setLogicOperatorMenuOpen(false) }}>
                <ActionButtonTiny
                    disableRipple
                    ref={buttonRef}
                    onClick={
                        ev => {
                            setLogicOperatorMenuOpen(true);
                        }
                    }>
                    <Add20 />
                </ActionButtonTiny>
            </ClickAwayListener>
        </PanelTitle>
        <div className="constraint-pool-root" ref={observedRef}>
            <div className="x6-container" ref={x6ContainerRef} />
        </div>
        <Callout
            target={buttonRef.current}
            isBeakVisible={false}
            hidden={!logicOperatorMenuOpen}
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
                        x6Ref.current && addLogicAndNode(x6Ref.current, newAndOperator.id);
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
    </GlobalPanel>
})