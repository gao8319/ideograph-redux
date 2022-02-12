import { Add20, Add24, Subtract20, Subtract24 } from "@carbon/icons-react";
import { Button } from "@mui/material";
import { nanoid } from "@reduxjs/toolkit";
import { useMemo } from "react";
import { BinaryOperator } from "../../../engine/ontology/Constraints";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { addConstraint, deleteConstraint } from "../../../store/slice/constraintSlicer";
import { elementConstraintsSelector, focusElementSelector, modelSelector, projectNameSelector, workspaceNameSelector } from "../../../store/slice/modelSlicer";
import { deleteNode } from "../../../store/slice/nodeSlicer";
import { IPatternNode } from "../../../utils/common/graph";
import { CommonModel } from "../../../utils/common/model";
import { ComparisonOperator } from "../../../utils/common/operator";
import { isNotEmpty } from "../../../utils/common/utils";
import { ConstraintField } from "../../ConstraintsEditor/ConstraintField";
import { ConstraintsEditor } from "../../ConstraintsEditor/ConstraintsEditor";
import { ActionButton, ActionButtonTiny } from "../common/ActionButton";
import { PanelTitle } from "../common/PanelTitle";

export const PropertyPanelContent = () => {
    const dispatch = useAppDispatch()
    const focusElement = useAppSelector(focusElementSelector);
    const model = useAppSelector(modelSelector);
    const focusClass = useMemo(
        () => {
            return model.classes.find(c => c.id === (focusElement as IPatternNode)?.classId)
        }, [focusElement?.id]
    )
    console.log(focusElement, model.classes);
    const constraints = useAppSelector(elementConstraintsSelector)


    return <div>
        <PanelTitle text="声明" />
        <div className="panel-desc">{JSON.stringify(focusElement)}</div>
        <PanelTitle text="属性约束" topBordered>
            <ActionButtonTiny disableRipple onClick={ev => {
                if (isNotEmpty(focusElement?.type)) {
                    dispatch(addConstraint({
                        targetType: focusElement!.type!,
                        targetId: focusElement!.id!,
                        expression: '',
                        operator: ComparisonOperator.Equal,
                        value: 0,
                        position: { x: 0, y: 0 },
                        id: nanoid()
                    }))
                }
            }}>
                <Add20 />
            </ActionButtonTiny>
        </PanelTitle>
        <div className="panel-constraints">
            {
                focusClass && constraints.map(
                    c => {
                        return <>
                            <ConstraintField node={focusElement as IPatternNode} class={focusClass} constraint={c} />
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
    </div>
}