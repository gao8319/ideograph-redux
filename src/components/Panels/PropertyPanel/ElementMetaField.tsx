import { VisualElementType } from "../../../engine/visual/VisualElement";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { focusElementSelector, modelSelector } from "../../../store/slice/modelSlicer";
import { modifyNode } from "../../../store/slice/nodeSlicer";
import { IPatternNode } from "../../../utils/common/graph";
import { CommonModel } from "../../../utils/common/model";
import { ClassDropdownField, EdgeDropdownField } from "../../ConstraintsEditor/DropdownField";
import { InputField } from "../../ConstraintsEditor/InputField"
import { ControlLabel } from "../common/ControlLabel"

interface IElementMetaField {
    focusElement: ReturnType<typeof focusElementSelector>,
    onChangeAlias: (newAlias: string) => void;
}


export const ElementMetaField = (props: IElementMetaField) => {
    const { focusElement } = props;
    const model = useAppSelector(modelSelector);
    const dispatch = useAppDispatch();
    if (!focusElement) return <div></div>
    if (focusElement.type === VisualElementType.Node) {
        return <>
            <div className="panel-decl hide-padding-bottom">
                <ControlLabel>概念</ControlLabel>
                <div>
                    <ClassDropdownField
                        defaultOption={focusElement.class as CommonModel.IColoredClass}
                        onSelectOption={opt => { }}
                        options={model?.classes??[]} />
                </div>
                <ControlLabel>名称</ControlLabel>
                <InputField
                    onFocus={ev => ev.target.select()}
                    onMouseUp={(ev) => { ev.preventDefault(); }}
                    inputProps={{
                        onFocus: ev => ev.target.select(),
                        onMouseUp: (ev) => { ev.preventDefault(); },
                    }}
                    placeholder={focusElement.id}
                    value={(focusElement as IPatternNode).alias}
                    onChange={(ev) => {
                        const newName = ev.target.value || ""
                        props.onChangeAlias(newName)
                    }}
                    />
            </div>
            <div className="panel-decl col2 hide-padding-top" >
                <ControlLabel className="offsetx2">X</ControlLabel>
                <InputField
                    placeholder="-"
                    defaultValue={(focusElement as IPatternNode).position.x}
                    onFocus={ev => ev.target.select()}
                    onMouseUp={(ev) => { ev.preventDefault(); }}
                    inputProps={{
                        onFocus: ev => ev.target.select(),
                        onMouseUp: (ev) => { ev.preventDefault(); },
                    }} />
                <ControlLabel className="offsetx2">Y</ControlLabel>
                <InputField
                    placeholder="-"
                    defaultValue={(focusElement as IPatternNode).position.y}
                    onFocus={ev => ev.target.select()}
                    onMouseUp={(ev) => { ev.preventDefault(); }}
                    inputProps={{
                        onFocus: ev => ev.target.select(),
                        onMouseUp: (ev) => { ev.preventDefault(); },
                    }} />
            </div>
        </>
    }
    if (focusElement.type === VisualElementType.Edge) {
        return <div className="panel-decl">
            <ControlLabel>概念</ControlLabel>
            <div>
                <EdgeDropdownField
                    defaultOption={focusElement.class as CommonModel.IColoredEdgeClass}
                    options={[focusElement.class as CommonModel.IColoredEdgeClass]}
                    onSelectOption={opt => { }} />
            </div>

            <ControlLabel>名称</ControlLabel>
            <InputField
                placeholder={focusElement.id}
                onFocus={ev => ev.target.select()}
                onMouseUp={(ev) => { ev.preventDefault(); }}
                inputProps={{
                    onFocus: ev => ev.target.select(),
                    onMouseUp: (ev) => { ev.preventDefault(); },
                }}/>
        </div>
    }
    return <div></div>
}