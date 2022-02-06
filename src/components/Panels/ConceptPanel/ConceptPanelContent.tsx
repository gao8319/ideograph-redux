import { Add20, ChevronDown16 } from "@carbon/icons-react";
import { CommandBarButton } from "@fluentui/react";
import { useMemo } from "react";
import { ColorSlot } from "../../../engine/visual/ColorSlot";
import { EditMode } from "../../../engine/visual/EditMode";
import { useAppSelector } from "../../../store/hooks";
import { editModeSelector, modelSelector, projectNameSelector, workspaceNameSelector } from "../../../store/slice/modelSlicer";
import { CommonModel } from "../../../utils/common/model";
import { PanelTitle } from "../common/PanelTitle";

const editModeMap = {
    [EditMode.Default]: '选择和移动',
    [EditMode.CreatingNode]: '添加概念',
    [EditMode.CreatingEdgeFrom]: '添加关系约束',
    [EditMode.CreatingEdgeTo]: '添加关系约束',
}

interface IPatternNodeItemProps {
    item: CommonModel.IClass,
    colorSlot: ColorSlot,
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
        // onClick={_ => props.onCreateNodePattern(o.className)}
        key={props.item.name}
    >
        <span style={{
            display: 'inline-flex',
            height: 40,
            alignItems: 'center',
            padding: 0
        }}>
            <CommandBarButton style={{ height: 40, width: 16, minWidth: 0, padding: 0, visibility: 'hidden' }} >
                <ChevronDown16 />
            </CommandBarButton>
            <svg width={24} height={40}>
                <circle cx={8} cy={20} r={8} fill={props.colorSlot.primary} />
            </svg>
            {props.item.name}
        </span>
        <CommandBarButton style={{ height: 40, width: 40, minWidth: 0, visibility: 'hidden' }} >
            <Add20 />
        </CommandBarButton>
    </div>
}

export const ConceptPanelContent = () => {
    const editMode = useAppSelector(editModeSelector);

    const modelObject = useAppSelector(modelSelector);
    const modelTree = useMemo(
        () => {
            const model = CommonModel.deserializeFromObject(modelObject);
            const item = model.colorSlots
            return Object.values(item)
        }, [modelObject]
    )

    return <div>
        <PanelTitle text={editModeMap[editMode]} />

        {editMode === EditMode.CreatingNode && <div>
            {
                modelTree.map(
                    m => <PatternNodeItem {...m} />
                )
            }
        </div>}

        {editMode >= 2 && <div className="panel-desc">依次点击画布中需要连接的概念来添加关系约束。</div>}
    </div>
}