import { Add20, Add24, Checkmark20, Subtract20, Subtract24 } from "@carbon/icons-react";
import { Button } from "@mui/material";
import { nanoid } from "@reduxjs/toolkit";
import React, { useEffect } from "react";
import { useMemo, useState } from "react";
import { BinaryOperator } from "../../../engine/ontology/Constraints";
import { PatternGraphEngine } from "../../../engine/PatternGraphEngine";
import { VisualElementType } from "../../../engine/visual/VisualElement";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { addConstraint, deleteConstraint, modifyConstraint } from "../../../store/slice/constraintSlicer";
import { elementConstraintsSelector, focusElementSelector, modelSelector, projectNameSelector, workspaceNameSelector } from "../../../store/slice/modelSlicer";
import { deleteNode } from "../../../store/slice/nodeSlicer";
import { IPatternNode } from "../../../utils/common/graph";
import { CommonModel } from "../../../utils/common/model";
import { ComparisonOperator } from "../../../utils/common/operator";
import { isNotEmpty } from "../../../utils/common/utils";
import { ConstraintField } from "../../ConstraintsEditor/ConstraintField";
import { ConstraintsEditor } from "../../ConstraintsEditor/ConstraintsEditor";
import { InputField } from "../../ConstraintsEditor/InputField";
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

    const constraints = useAppSelector(elementConstraintsSelector)

    // const [isTemporalFieldOpen, setTemporalFieldOpen] = useState(false);

    if (!focusElement) return <div>
        <PanelTitle text="定义和属性约束" />
        <div className="panel-desc">选中点或边以查看其定义和约束。</div>
    </div>

    return <div>
        <PanelTitle text="定义" />
        <ElementMetaField focusElement={focusElement} key={focusElement.id} />
        {focusElement.class?.properties?.length ? <>
            <PanelTitle text="属性约束" topBordered>
                <ActionButtonTiny
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
                </ActionButtonTiny>
            </PanelTitle>
            <div className="panel-constraints">
                {
                    constraints.map(
                        c => {
                            return <>
                                <ConstraintField
                                    node={focusElement as IPatternNode}
                                    class={focusElement.class}
                                    constraint={c}
                                    onConstraintChange={
                                        _c => {
                                            dispatch(modifyConstraint({ id: c.id, changes: _c }))
                                        }
                                    } />
                                <ActionButtonTiny disableRipple onClick={_ => {
                                    dispatch(deleteConstraint(c.id))
                                }}>
                                    <Subtract20 />
                                </ActionButtonTiny>
                            </>
                        }
                    )
                }
            </div>
        </> : <>
            <PanelTitle text="属性约束" topBordered />
            <div className="panel-desc">
                {focusElement.type === VisualElementType.Node ?
                    `无法对概念${focusElement.class.name}添加约束，因为这个类型不包含属性。`
                    : `无法对${focusElement.class.name}的边添加属性约束，因为这条边不包含属性。`}
            </div>
        </>}
    </div >
}