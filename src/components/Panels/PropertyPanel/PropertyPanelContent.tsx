import { useMemo } from "react";
import { useAppSelector } from "../../../store/hooks";
import { modelSelector, projectNameSelector, workspaceNameSelector } from "../../../store/slice/modelSlicer";
import { CommonModel } from "../../../utils/common/model";
import { PanelTitle } from "../common/PanelTitle";

export const PropertyPanelContent = () => {

    return <div>
        <PanelTitle text="属性" />
    </div>
}