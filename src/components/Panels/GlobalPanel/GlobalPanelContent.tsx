import { Update } from "@reduxjs/toolkit";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../../store/hooks";
import { lastConstraintOperationSelector } from "../../../store/slice/constraintSlicer";
import { modelSelector, projectNameSelector, workspaceNameSelector } from "../../../store/slice/modelSlicer";
import { IConstraint } from "../../../utils/common/graph";
import { PanelTitle } from "../common/PanelTitle";
import { Graph, Path, Shape, Node } from '@antv/x6';
import { addLogicAddNode, addLogicNotNode, addLogicOrNode, createConstraintNode, createLogicComposingGraph, modifyConstraintNode, removeConstraintNode } from "./X6Elements";
import { update } from "lodash";
import { ActionButtonTiny } from "../common/ActionButton";
import { Add20 } from "@carbon/icons-react";
import { ClickAwayListener } from "@mui/material";
import { Callout, DirectionalHint } from "@fluentui/react";

export const GlobalPanelContent = () => {
    const model = useAppSelector(modelSelector);
    const lastConstraintOperation = useAppSelector(lastConstraintOperationSelector);
    const x6ContainerRef = useRef<HTMLDivElement>(null);

    const x6Ref = useRef<Graph>();

    const nodeDictRef = useRef<Map<string, Node>>(new Map());

    useEffect(() => {
        const container = x6ContainerRef.current;
        if (container) {
            const g = createLogicComposingGraph(container);
            x6Ref.current = g;
            return () => {
                g?.dispose();
                x6Ref.current = undefined;
            }
        }
    }, [x6ContainerRef.current])

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
                        // removeConstraintNode(x6Ref.current, lastConstraintOperation.payload.payload as string);
                        break;
                    }
                    case "updateOne": {
                        const p = lastConstraintOperation.payload.payload as Update<IConstraint>;
                        const n = nodeDictRef.current?.get(p.id as string);

                        // console.log(p);
                        // modifyConstraintNode(x6Ref.current, p);
                        if (n) {
                            modifyConstraintNode(n, p);
                        }
                        break;
                    }
                }
            }
        }, [lastConstraintOperation, x6Ref.current]
    )

    const [logicOperatorMenuOpen, setLogicOperatorMenuOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    return <>
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
        <div className="constraint-pool-root">
            <div className="x6-container" ref={x6ContainerRef}>

            </div>
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
            <div style={{ background: '#212224', padding: '8px 1px', borderRadius: 0, maxHeight: '90vh', overflow: 'auto'}}>
                <li
                    className="contextual-menu-item"
                    onClick={ev => {
                        x6Ref.current && addLogicAddNode(x6Ref.current);
                        setLogicOperatorMenuOpen(false)
                    }}>
                    <span>与</span>
                    <span style={{ opacity: 0.25 }} className="shimmed">A</span>
                </li>
                <li
                    className="contextual-menu-item"
                    style={{}}
                    onClick={ev => {
                        x6Ref.current && addLogicOrNode(x6Ref.current);
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
                        x6Ref.current && addLogicNotNode(x6Ref.current);
                        setLogicOperatorMenuOpen(false)
                    }}>
                    <span>非</span>
                    <span style={{ opacity: 0.25 }} className="shimmed">N</span>
                </li>
            </div>
        </Callout>
    </>
}