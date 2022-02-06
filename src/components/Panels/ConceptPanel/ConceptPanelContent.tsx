import { useMemo } from "react";
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

export const ConceptPanelContent = () => {
    const model = useAppSelector(modelSelector);
    const editMode = useAppSelector(editModeSelector);

    const modelObject = useAppSelector(modelSelector);
    const modelTree = useMemo(
        () => {
            console.log('!!!')
            const model = CommonModel.deserializeFromObject(modelObject);
            const tree = model.classesByTreeView
            return tree
        }, [modelObject]
    )

    return <div>
        <PanelTitle text={editModeMap[editMode]} />

        {editMode === EditMode.CreatingNode && <div>
            {JSON.stringify(modelTree)}
        </div>}

        {editMode >= 2 && <div className="panel-desc">依次点击画布中需要连接的概念来添加关系约束。</div>}
    </div>
}