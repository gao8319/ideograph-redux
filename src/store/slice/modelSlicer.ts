import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EditMode } from "../../engine/visual/EditMode";
import { askGraphModel } from "../../utils/AskGraph";
import { convertAskGraphOntModel } from "../../utils/AskGraphConverter";
import { CommonModel } from "../../utils/common/model";
import { RootState } from "../store";

type WorkspaceState = {
    model: CommonModel.ISerializedRoot,
    editMode: EditMode,
    workspaceName: string,
    projectName: string,
    lastModifiedTime: number,
    createTime: number,
}

const initialState: WorkspaceState = {
    model: convertAskGraphOntModel(askGraphModel),
    editMode: EditMode.CreatingNode,
    projectName: '智慧城市领域知识模型系统',
    workspaceName: '新工作区',
    createTime: new Date().getMilliseconds(),
    lastModifiedTime: new Date().getMilliseconds(),
}

const workspaceSlicer = createSlice({
    name: 'workspace',
    initialState,
    reducers: {
        setModel(state, action: PayloadAction<CommonModel.ISerializedRoot>) {
            state.model = action.payload
        },
        setEditMode(state, action: PayloadAction<EditMode>) {
            state.editMode = action.payload;
        },
        setWorkspaceName(state, action: PayloadAction<string>) {
            state.workspaceName = action.payload
        },
        setProjectName(state, action: PayloadAction<string>) {
            state.projectName = action.payload
        },
        applyQuery() {
            alert('Query is not implemented.')
        },

    }
})

export const {
    setModel,
    setEditMode,
    setWorkspaceName,
    setProjectName,
    applyQuery,
} = workspaceSlicer.actions;

export const modelSelector = (state: RootState) => state.workspace.model
export const editModeSelector = (state: RootState) => state.workspace.editMode
export const projectNameSelector = (state: RootState) => state.workspace.projectName
export const workspaceNameSelector = (state: RootState) => state.workspace.workspaceName
export const lastModifiedTimeSelector = (state: RootState) => state.workspace.lastModifiedTime

export default workspaceSlicer.reducer;