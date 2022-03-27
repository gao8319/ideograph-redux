import { AnyAction, applyMiddleware, createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EditMode } from "../../engine/visual/EditMode";
import { VisualElementType } from "../../engine/visual/VisualElement";
import { Schema, schemaToCommonModel } from "../../services/Schema";
import { EdgeDirection, IPatternEdge, IPatternNode } from "../../utils/common/graph";
import { CommonModel } from "../../utils/common/model";
import { pangu } from "../../utils/common/pangu";
import { RootState } from "../store";
import { constraintsSelectors } from "./constraintSlicer";
import { edgesSelectors } from "./edgeSlicer";
import { nodesSelectors } from "./nodeSlicer";

import thunk, { ThunkDispatch } from 'redux-thunk';
import { queryForage, QueryForageItem } from "../../utils/global/Storage";

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
    model: CommonModel.ISerializedRoot | null,
    editMode: EditMode,
    workspaceName: string,
    projectName: string,
    lastModifiedTime: number,
    createTime: number,

    leftPanelWidth: number,
    rightPanelWidth: number,
    bottomPanelHeight: number,

    focusElement?: FocusElementPayload,
    editPayload?: string | number,


    codeModalState: AcceptableQueryLanguage | undefined,

    queryModalState: boolean,


    dataSourceId: string,
    fileId: string,
}

// const converted = convertAskGraphOntModel(askGraphModel);
// const defaultModel = CommonModel.serializeToObject(
//     new CommonModel.Root(converted.name, converted.classes, converted.relations)
// )


// const injectedModel = new CommonModel.Root(
//     '测试模型',
//     [
//         {
//             id: 'Person',
//             name: '人',
//             properties: [{
//                 id: 'Name',
//                 type: PrimitiveTypeName.String,
//                 name: '名字'
//             }, {
//                 id: 'Age',
//                 type: PrimitiveTypeName.Number,
//                 name: '年龄'
//             }]
//         },
//         {
//             id: 'Account',
//             name: '账户',
//             properties: [{
//                 id: 'AccountID',
//                 type: PrimitiveTypeName.String,
//                 name: '账户ID'
//             }]
//         },
//         {
//             id: 'Bank',
//             name: '银行',
//             properties: []
//         }
//     ],
//     [
//         {
//             id: 'Transfer',
//             name: '转账',
//             from: 'Account',
//             to: 'Account',
//             properties: [{
//                 id: 'Amount',
//                 type: PrimitiveTypeName.Number,
//                 name: '金额'
//             }],
//             direction: EdgeDirection.Specified,
//         },
//         {
//             id: 'Owns',
//             name: '拥有',
//             from: 'Person',
//             to: 'Account',
//             properties: [],
//             direction: EdgeDirection.Specified,
//         }
//     ]
// )

// const injectedModelObject = CommonModel.serializeToObject(injectedModel);

const initTime = new Date().getTime();

const initialState: WorkspaceState = {
    model: null,
    editMode: EditMode.CreatingNode,
    projectName: "",
    workspaceName: '',
    createTime: initTime,
    lastModifiedTime: initTime,
    leftPanelWidth: LEFT_DEFAULT,
    rightPanelWidth: RIGHT_DEFAULT,
    bottomPanelHeight: BOTTOM_DEFAULT,
    codeModalState: undefined,
    queryModalState: false,
    dataSourceId: "",
    fileId: ""
}


type NewWorkspaceState = {
    model: CommonModel.ISerializedRoot | null,
    editMode: EditMode.CreatingNode,
    workspaceName: string,
    projectName: string,
    lastModifiedTime: number,
    createTime: number,
    dataSourceId: string,
    fileId: string,

}

export type AcceptableQueryLanguage = "AskGraph API" | "Cypher" | "GraphQL" | "SQL" | "JSON"

const workspaceSlicer = createSlice({
    name: 'workspace',
    initialState,
    reducers: {
        setModel(state, action: PayloadAction<CommonModel.ISerializedRoot | null>) {
            state.model = action.payload
        },
        setModelBySchema(state, action: PayloadAction<Schema.Entry>) {
            state.model = schemaToCommonModel(action.payload)
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
        applyQuery(state, action: PayloadAction<boolean>) {
            state.queryModalState = action.payload
        },
        exportToJson() {
            // alert('Export is not implemented.')
        },
        inspectGeneratedCode(state, action: PayloadAction<AcceptableQueryLanguage>) {
            // alert('Inspect is not implemented.')
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
        },
        setCodeModal(state, action: PayloadAction<AcceptableQueryLanguage | undefined>) {
            state.codeModalState = action.payload;
        },
        applyFileToWorkspace(state, action: PayloadAction<NewWorkspaceState>) {
            state.projectName = action.payload.projectName;
            state.workspaceName = action.payload.workspaceName;
            state.createTime = action.payload.createTime;
            state.lastModifiedTime = action.payload.lastModifiedTime;
            state.fileId = action.payload.fileId;
            state.dataSourceId = action.payload.dataSourceId;
            state.model = null;
            state.editMode = EditMode.CreatingNode;
        },
        clearWorkspace(state) {
            state.projectName = '';
            state.workspaceName = '';
            state.createTime = 0;
            state.lastModifiedTime = 0;
            state.fileId = '';
            state.dataSourceId = '';
            state.model = null;
            state.editMode = EditMode.CreatingNode;
        }
    }
})


export const saveFileWorkspace = () => (
    async (dispatch: ThunkDispatch<RootState, null, AnyAction>, getState: () => RootState) => {
        const state = getState();
        const file: QueryForageItem = {
            id: state.workspace.fileId,
            name: state.workspace.workspaceName,
            nodes: state.nodes,
            edges: state.edges,
            constraints: state.constraints,
            dataSourceId: state.workspace.dataSourceId,
            solutionCaches: [],
            createTime: state.workspace.createTime,
            lastEditTime: new Date().getTime(),
        }
        queryForage.setItem(file.id, file);
        console.log(`[FileSystem] ${file.name} (${file.id}) saved at ${file.lastEditTime}.`);
    }
)


export const {
    setModel,
    setModelBySchema,
    clearWorkspace,
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
    setCodeModal,
    applyFileToWorkspace,
} = workspaceSlicer.actions;

export const modelSelector = (state: RootState) => state.workspace.model
export const codeModalSelector = (state: RootState) => state.workspace.codeModalState
export const queryModalSelector = (state: RootState) => state.workspace.queryModalState
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
    modelSelector,
    _focusElementSelector,
    (nodes, edges, model, fe): ((IPatternNode | IPatternEdge) & { type: VisualElementType }) | undefined => {
        if (!model) return undefined;
        if (fe?.type === VisualElementType.Node) {
            return { ...nodes[fe.payload.id!]!, type: VisualElementType.Node }
        }
        else if (fe?.type === VisualElementType.Edge) {
            const fromClass = nodes[fe.payload.from!]?.class.id
            const toClass = nodes[fe.payload.to!]?.class.id
            if (fromClass && toClass) {
                const properties = model.relations.filter(it => it.from === fromClass && it.to === toClass)
                return { ...edges[fe.payload.id!]!, type: VisualElementType.Edge, class: { ...edges[fe.payload.id!]!.class, properties: properties.flatMap(it => it.properties).filter(it => it !== undefined) as CommonModel.IProperty[] } }
            }
            return { ...nodes[fe.payload.id!]!, type: VisualElementType.Node }
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