import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EditMode } from "../../engine/visual/EditMode";
import { VisualElementType } from "../../engine/visual/VisualElement";
import { askGraphModel } from "../../utils/AskGraph";
import { convertAskGraphOntModel } from "../../utils/AskGraphConverter";
import { IPatternEdge, IPatternNode } from "../../utils/common/graph";
import { CommonModel } from "../../utils/common/model";
import { pangu } from "../../utils/common/pangu";
import { RootState } from "../store";
import { constraintsSelectors } from "./constraintSlicer";
import { edgesSelectors } from "./edgeSlicer";
import { nodesSelectors } from "./nodeSlicer";

export const LEFT_DEFAULT = 240;
export const LEFT_MIN = 200;
export const LEFT_MAX = 420;


export const RIGHT_DEFAULT = 360;
export const RIGHT_MIN = 300;
export const RIGHT_MAX = 720;


export const BOTTOM_DEFAULT = 320;
export const BOTTOM_MIN = 240;
export const BOTTOM_MAX = 640;

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

const converted = convertAskGraphOntModel(askGraphModel);
const defaultModel = CommonModel.serializeToObject(
    new CommonModel.Root(converted.name, converted.classes, converted.relations)
)


const initialState: WorkspaceState = {
    model: defaultModel,
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
            if (action.payload !== EditMode.CreatingNode) {
                state.editPayload = undefined;
            }
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
        setFocus(state, action: PayloadAction<FocusElementPayload | undefined>) {
            state.focusElement = action.payload;
        },
        setEditModeWithPayload(state, action: PayloadAction<{ editMode: EditMode, payload: string | number | undefined }>) {
            if (action.payload.editMode === EditMode.CreatingNode) {
                state.editPayload = action.payload.payload;
            }
            else {
                state.editPayload = undefined;
            }
            state.editMode = action.payload.editMode;
        },
        setEditPayloadDangerously(state, action: PayloadAction<string | number | undefined>) {
            state.editPayload = action.payload;
        }
    }
})

export const {
    // setModel,
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
    setEditModeWithPayload,
    setEditPayloadDangerously,
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
    (nodes, edges, fe): ((IPatternNode | IPatternEdge) & { type: VisualElementType }) | undefined => {
        if (fe?.type === VisualElementType.Node) {
            return { ...nodes[fe.payload.id!]!, type: VisualElementType.Node }
        }
        else if (fe?.type === VisualElementType.Edge) {
            return { ...edges[fe.payload.id!]!, type: VisualElementType.Edge }
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