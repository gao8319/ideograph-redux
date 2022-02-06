import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EditMode } from "../../engine/visual/EditMode";
import { askGraphModel } from "../../utils/AskGraph";
import { convertAskGraphOntModel } from "../../utils/AskGraphConverter";
import { CommonModel } from "../../utils/common/model";
import { RootState } from "../store";

export const LEFT_DEFAULT = 320;
export const LEFT_MIN = 200;
export const LEFT_MAX = 480;


export const RIGHT_DEFAULT = 280
export const RIGHT_MIN = 200;
export const RIGHT_MAX = 480;


export const BOTTOM_DEFAULT = 420;
export const BOTTOM_MIN = 360;
export const BOTTOM_MAX = 720;

type WorkspaceState = {
    model: CommonModel.ISerializedRoot,
    editMode: EditMode,
    workspaceName: string,
    projectName: string,
    lastModifiedTime: number,
    createTime: number,

    leftPanelWidth: number,
    rightPanelWidth: number,
    bottomPanelHeight: number,
}

const initialState: WorkspaceState = {
    model: convertAskGraphOntModel(askGraphModel),
    editMode: EditMode.CreatingNode,
    projectName: '智慧城市领域知识模型系统',
    workspaceName: '新工作区',
    createTime: new Date().getTime(),
    lastModifiedTime: new Date().getTime(),
    leftPanelWidth: LEFT_DEFAULT,
    rightPanelWidth: RIGHT_DEFAULT,
    bottomPanelHeight: BOTTOM_DEFAULT,
}

export type AcceptableQueryLanguage = "Cypher" | "GraphQL" | "SQL"

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
        exportToJson() {
            alert('Export is not implemented.')
        },
        inspectGeneratedCode(state, action: PayloadAction<AcceptableQueryLanguage>) {
            alert('Inspect is not implemented.')
        },
        setRightPanelWidth(state, action: PayloadAction<number>) {
            if (action.payload <= RIGHT_MAX && action.payload >= RIGHT_MIN)
                state.rightPanelWidth = action.payload
        },
        setLeftPanelWidth(state, action: PayloadAction<number>) {
            if (action.payload <= LEFT_MAX && action.payload >= LEFT_MIN)
                state.leftPanelWidth = action.payload
        },
        setBottomPanelHeight(state, action: PayloadAction<number>) {
            if (action.payload <= BOTTOM_MAX && action.payload >= BOTTOM_MIN)
                state.bottomPanelHeight = action.payload
        },

    }
})

export const {
    setModel,
    setEditMode,
    setWorkspaceName,
    setProjectName,
    applyQuery,
    exportToJson,
    inspectGeneratedCode,
    setRightPanelWidth,
    setLeftPanelWidth,
    setBottomPanelHeight,
} = workspaceSlicer.actions;

export const modelSelector = (state: RootState) => state.workspace.model
export const editModeSelector = (state: RootState) => state.workspace.editMode
export const projectNameSelector = (state: RootState) => state.workspace.projectName
export const workspaceNameSelector = (state: RootState) => state.workspace.workspaceName
export const lastModifiedTimeSelector = (state: RootState) => state.workspace.lastModifiedTime
export const leftPanelWidthSelector = (state: RootState) => state.workspace.leftPanelWidth
export const rightPanelWidthSelector = (state: RootState) => state.workspace.rightPanelWidth
export const bottomPanelHeightSelector = (state: RootState) => state.workspace.bottomPanelHeight

export const workspaceSelector = (state: RootState) => state.workspace

export default workspaceSlicer.reducer;