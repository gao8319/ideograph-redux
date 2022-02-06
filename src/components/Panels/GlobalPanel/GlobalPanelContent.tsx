import { useAppSelector } from "../../../store/hooks";
import { modelSelector, projectNameSelector, workspaceNameSelector } from "../../../store/slice/modelSlicer";
import { PanelTitle } from "../common/PanelTitle";

export const GlobalPanelContent = () => {
    const model = useAppSelector(modelSelector);
    return <>
        <PanelTitle text="全局逻辑"/>
        <div className="constraint-pool-root">

        </div>
    </>
}