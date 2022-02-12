import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EditMode } from "../../engine/visual/EditMode";
import { VisualElementType } from "../../engine/visual/VisualElement";
import { askGraphModel } from "../../utils/AskGraph";
import { convertAskGraphOntModel } from "../../utils/AskGraphConverter";
import { IPatternEdge, IPatternNode } from "../../utils/common/graph";
import { CommonModel } from "../../utils/common/model";
import { RootState } from "../store";
import { constraintsSelectors } from "./constraintSlicer";
import { edgesSelectors } from "./edgeSlicer";
import { nodesSelectors } from "./nodeSlicer";

export const LEFT_DEFAULT = 320;
export const LEFT_MIN = 200;
export const LEFT_MAX = 480;


export const RIGHT_DEFAULT = 280
export const RIGHT_MIN = 200;
export const RIGHT_MAX = 480;


export const BOTTOM_DEFAULT = 420;
export const BOTTOM_MIN = 360;
export const BOTTOM_MAX = 720;

type FocusElementPayload = {
    type: VisualElementType.Edge,
    payload: IPatternEdge,
} | {
    type: VisualElementType.Node,
    payload: IPatternNode,
}

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

    focusElement?: FocusElementPayload,
    editPayload?: string | number
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
        // setEdgeFocused(state, action: PayloadAction<IPatternEdge>) {
        //     state.focusElement = {
        //         type: VisualElementType.Edge,
        //         payload: action.payload
        //     }
        // },
        // setNodeFocused(state, action: PayloadAction<IPatternNode>) {
        //     state.focusElement = {
        //         type: VisualElementType.Node,
        //         payload: action.payload,
        //     }
        // },
        // setNothingFocused(state) {
        //     state.focusElement = undefined;
        // },
        setFocus(state, action: PayloadAction<FocusElementPayload | undefined>) {
            state.focusElement = action.payload;
        },
        setEditModeWithPayload(state, action: PayloadAction<{ editMode: EditMode, payload: string | number | undefined }>) {
            state.editMode = action.payload.editMode;
            state.editPayload = action.payload.payload;
        }
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
    setFocus,
    setEditModeWithPayload
} = workspaceSlicer.actions;

export const modelSelector = (state: RootState) => state.workspace.model
export const editModeSelector = (state: RootState) => state.workspace.editMode
export const projectNameSelector = (state: RootState) => state.workspace.projectName
export const workspaceNameSelector = (state: RootState) => state.workspace.workspaceName
export const lastModifiedTimeSelector = (state: RootState) => state.workspace.lastModifiedTime
export const leftPanelWidthSelector = (state: RootState) => state.workspace.leftPanelWidth
export const rightPanelWidthSelector = (state: RootState) => state.workspace.rightPanelWidth
export const bottomPanelHeightSelector = (state: RootState) => state.workspace.bottomPanelHeight
export const _focusElementSelector = (state: RootState) => state.workspace.focusElement

export const focusElementSelector = createSelector(
    nodesSelectors.selectEntities,
    edgesSelectors.selectEntities,
    _focusElementSelector,
    (nodes, edges, fe) => {
        if (fe?.type === VisualElementType.Node) {
            return { ...nodes[fe.payload.id], type: VisualElementType.Node }
        }
        else if (fe?.type === VisualElementType.Edge) {
            return { ...edges[fe.payload.id], type: VisualElementType.Edge }
        }
        else return undefined
    }
)


export const elementConstraintsSelector = createSelector(
    constraintsSelectors.selectAll,
    _focusElementSelector,
    (constraints, fe) => {
        return constraints.filter(c => c.targetId === fe?.payload.id)
    }
)

export const editPayloadSelector = (state: RootState) => state.workspace.editPayload

export const workspaceSelector = (state: RootState) => state.workspace

export default workspaceSlicer.reducer;