import { Add20, Add24, Checkmark20, Draggable16, Subtract20, Subtract24 } from "@carbon/icons-react";
import { Callout, DirectionalHint } from "@fluentui/react";
import { Button, ClickAwayListener } from "@mui/material";
import { nanoid } from "@reduxjs/toolkit";
import React, { useEffect, useRef } from "react";
import { useMemo, useState } from "react";
import { BinaryOperator } from "../../../engine/ontology/Constraints";
import { PatternGraphEngine } from "../../../engine/PatternGraphEngine";
import { VisualElementType } from "../../../engine/visual/VisualElement";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { addConstraint, addConstraintToContext, constraintsSelectors, deleteConstraint, modifyConstraint } from "../../../store/slice/constraintSlicer";
import { elementConstraintsSelector, focusElementSelector, modelSelector, projectNameSelector, workspaceNameSelector } from "../../../store/slice/modelSlicer";
import { deleteNode } from "../../../store/slice/nodeSlicer";
import { IPatternNode } from "../../../utils/common/graph";
import { CommonModel } from "../../../utils/common/model";
import { ComparisonOperator } from "../../../utils/common/operator";
import { isNotEmpty } from "../../../utils/common/utils";
import { ConstraintDialog } from "../../ConstraintDialog";
import { ConstraintCreateBlock } from "../../ConstraintsEditor/ConstraintCreateBlock";
import { ConstraintField } from "../../ConstraintsEditor/ConstraintField";
import { ConstraintsEditor } from "../../ConstraintsEditor/ConstraintsEditor";
import { DropdownButton, DropdownContent, DropdownContentUnstyled, DropdownOption, DropdownOptionUnstyled, EdgeDropdownField } from "../../ConstraintsEditor/DropdownField";
import { InputField } from "../../ConstraintsEditor/InputField";
import { StyledButton, StyledDefaultButton, StyledInput, StyledLightInput, StyledSelect } from "../../Styled/StyledComponents";
import { ActionButton, ActionButtonTiny } from "../common/ActionButton";
import { ControlLabel } from "../common/ControlLabel";
import { PanelTitle } from "../common/PanelTitle";
import { ElementMetaField } from "./ElementMetaField";


interface IPropertyPanelContent {
    engine?: PatternGraphEngine
}

export const PropertyPanelContent = (props: IPropertyPanelContent) => {
    const dispatch = useAppDispatch()
    const focusElement = useAppSelector(focusElementSelector);

    // const constraints = useAppSelector(elementConstraintsSelector);
    const constraints = useAppSelector(constraintsSelectors.selectAll);
    const [isConstraintDialogOpen, setConstraintDialogOpen] = useState(false);

    const addButtonRef = useRef<HTMLDivElement>(null);

    // const [isTemporalFieldOpen, setTemporalFieldOpen] = useState(false);

    if (!focusElement) return <div>
        <PanelTitle text="定义和属性约束" />
        <div className="panel-desc">选中点或边以查看其定义和约束。</div>
    </div>

    return <><div>
        <PanelTitle text="定义" />
        <ElementMetaField focusElement={focusElement} key={focusElement.id} />
        <div style={{ height: 32 }} />
        {focusElement.class?.properties?.length ? <>
            <PanelTitle text="约束定义" topBordered>
                {/* <ActionButtonTiny
                    disableRipple
                    onClick={
                        ev => {
                            if (isNotEmpty(focusElement.type)) {
                                dispatch(
                                    addConstraint({
                                        targetType: focusElement.type,
                                        targetId: focusElement.id,
                                        position: { x: 0, y: 0 },
                                        id: nanoid(),
                                    })
                                )
                            }
                        }
                    }>
                    <Add20 />
                </ActionButtonTiny> */}
            </PanelTitle>
            <ConstraintCreateBlock
                node={focusElement as IPatternNode}
                class={focusElement.class}
                key={focusElement.id}
                onConstraintCreate={c => {
                    dispatch(
                        addConstraint({
                            targetType: focusElement.type,
                            targetId: focusElement.id,
                            position: { x: 0, y: 0 },
                            id: nanoid(),
                            ...c
                        })
                    )
                }}
            />

            <div style={{ height: 32 }} />

            {/* <div ref={addButtonRef}>
                {isConstraintDialogOpen ?
                    <StyledDefaultButton
                        style={{
                            gridColumnStart: 1,
                            gridColumnEnd: 3,
                            margin: '4px 16px',
                            width: 'calc(100% - 32px)'
                        }}
                        onClick={_ => setConstraintDialogOpen(true)}
                        // ref={addButtonRef}

                        disabled={isConstraintDialogOpen}
                    >
                        <Add20 fill="var(--grey700)" />
                        添加属性约束
                    </StyledDefaultButton>
                    : <StyledButton
                        style={{
                            gridColumnStart: 1,
                            gridColumnEnd: 3,
                            margin: '4px 16px',
                            width: 'calc(100% - 32px)'
                        }}
                        onClick={_ => setConstraintDialogOpen(true)}

                        disabled={isConstraintDialogOpen}>
                        <Add20 fill="#fff" />
                        添加属性约束
                    </StyledButton>}
            </div> */}

            <PanelTitle text="已添加的属性约束" topBordered />

            <div className="panel-constraints" style={{ maxHeight: 'calc(100vh - 480px)' }}>
                {
                    constraints.map(
                        c => {
                            return <div
                                draggable
                                key={c.id}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '16px 1fr 32px 32px',
                                    // background: 'var(--grey20)',
                                    padding: '4px 2px',
                                    borderRadius: 4,
                                    alignItems: 'center',
                                }}
                                className="damn"
                            >
                                <Draggable16 style={{ transform: 'translate(-2px)' }} />
                                <ConstraintField
                                    node={focusElement as IPatternNode}
                                    class={focusElement.class}
                                    constraint={c}
                                    onConstraintChange={
                                        _c => {
                                            dispatch(modifyConstraint({ id: c.id, changes: _c }))
                                        }
                                    } />
                                <ActionButtonTiny disableRipple
                                    style={{
                                        marginLeft: 4,
                                    }}
                                    onClick={_ => {
                                        dispatch(deleteConstraint(c.id))
                                    }}>
                                    <Subtract20 />
                                </ActionButtonTiny>
                                <ActionButtonTiny disableRipple onClick={_ => {
                                    dispatch(addConstraintToContext(c))
                                }}>
                                    <Add20 />
                                </ActionButtonTiny>
                            </div>
                        }
                    )
                }

            </div>

        </> : <>
            <PanelTitle text="约束定义" topBordered />
            <div className="panel-desc">
                {focusElement.type === VisualElementType.Node ?
                    `无法对概念${focusElement.class.name}添加约束，因为这个类型不包含属性。`
                    : `无法对${focusElement.class.name}的边添加属性约束，因为这条边不包含属性。`}
            </div>
        </>}
    </div>
        {
            isConstraintDialogOpen &&
            <Callout
                target={addButtonRef.current}
                onDismiss={_ => setConstraintDialogOpen(false)}
                isBeakVisible={false}

                directionalHint={DirectionalHint.leftTopEdge}
                styles={{
                    calloutMain: {
                        borderRadius: 0,
                        animation: 'none'
                    }
                }}
            >
                <ConstraintDialog
                    node={focusElement as IPatternNode}
                    class={focusElement.class}
                    onDismiss={() => setConstraintDialogOpen(false)}
                    // constraint={c}
                    onConstraintChange={
                        _c => {
                            // dispatch(modifyConstraint({ id: c.id, changes: _c }))
                        }
                    } />
            </Callout>
            // </ClickAwayListener>
        }
    </>
}