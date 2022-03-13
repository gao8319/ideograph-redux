import { Add20, ChevronDown16 } from "@carbon/icons-react";
import { CommandBarButton } from "@fluentui/react";
import { useMemo } from "react";
import { ColorSlot } from "../../../engine/visual/ColorSlot";
import { EditMode } from "../../../engine/visual/EditMode";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { editModeSelector, modelSelector, projectNameSelector, setEditModeWithPayload, workspaceNameSelector } from "../../../store/slice/modelSlicer";
import { CommonModel } from "../../../utils/common/model";
import { PanelTitle } from "../common/PanelTitle";

const editModeMap = {
    [EditMode.Default]: '选择和移动',
    [EditMode.CreatingNode]: '添加概念',
    [EditMode.CreatingEdgeFrom]: '添加关系约束',
    [EditMode.CreatingEdgeTo]: '添加关系约束',
}

interface IPatternNodeItemProps {
    item: CommonModel.IColoredClass,
    onClick?: React.MouseEventHandler<HTMLDivElement>
}

const PatternNodeItem = (props: IPatternNodeItemProps) => {
    return <div
        className="ontology-create-button"
        style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 40,
            fontSize: 14,
            cursor: 'pointer',
        }}
        onClick={props.onClick}
        key={props.item.name}
    >
        <div style={{
            display: 'grid',
            height: 40,
            alignItems: 'center',
            padding: 0,
            gridTemplateColumns: '16px 24px 1fr',
            width: 'calc(100% - 40px)'
        }}>
            <CommandBarButton style={{ height: 40, width: 16, minWidth: 0, padding: 0, visibility: 'hidden' }} >
                <ChevronDown16 />
            </CommandBarButton>
            <svg width={24} height={40}>
                <circle cx={8} cy={20} r={8} fill={props.item.colorSlot.primary} />
            </svg>
            <div className="truncate" style={{width: '100%'}}>
                {props.item.name}
            </div>
        </div>
        <CommandBarButton style={{ height: 40, width: 40, minWidth: 0, visibility: 'hidden' }} >
            <Add20 />
        </CommandBarButton>
    </div>
}

export const ConceptPanelContent = () => {
    const dispatch = useAppDispatch();
    const editMode = useAppSelector(editModeSelector);
    const modelObject = useAppSelector(modelSelector);

    return <div>
        <PanelTitle text={editModeMap[editMode]} />

        {editMode === EditMode.CreatingNode && <div>
            {
                modelObject.classes.map(
                    m => <PatternNodeItem key={m.id} item={m} onClick={
                        ev => {
                            dispatch(setEditModeWithPayload(
                                { editMode: EditMode.CreatingNode, payload: m.id }
                            ))
                        }
                    } />
                )
            }
        </div>}

        {editMode >= 2 && <div className="panel-desc">依次点击画布中需要连接的概念来添加关系约束。</div>}
    </div>
}