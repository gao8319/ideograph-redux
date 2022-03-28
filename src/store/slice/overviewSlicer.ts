import { AnyAction, createSlice, PayloadAction, ThunkDispatch } from "@reduxjs/toolkit"
import { stringify } from "ajv"
import { EditMode } from "../../engine/visual/EditMode"
import { fetchSchema } from "../../services/Schema"
import { dataSourceForage, DataSourceForageItem, getFileOverviews, initDatabase, queryForage, QueryForageItem } from "../../utils/global/Storage"
import type { RootState } from "../store"
import { constraintRenewal } from "./constraintSlicer"
import { edgeRenewal } from "./edgeSlicer"
import { applyFileToWorkspace, setModelBySchema, setProjectName } from "./modelSlicer"
import { nodeRenewal, nodesSelectors } from "./nodeSlicer"


type OverviewState = {
    overviews: Awaited<ReturnType<typeof getFileOverviews>>,
}


const initialState: OverviewState = {
    overviews: []
}


const overviewSlicer = createSlice({
    name: 'overview',
    initialState,
    reducers: {
        setOverviews: (state, action: PayloadAction<OverviewState['overviews']>) => {
            state.overviews = action.payload;
        },
        deleteFile: (state, action: PayloadAction<QueryForageItem>) => {
            const dbIndex = state.overviews.findIndex(o => o.dataSource.id === action.payload.dataSourceId)
            const fIndex = state.overviews[dbIndex].queries.findIndex(q => q.id == action.payload.id)

            const fList = state.overviews[dbIndex].queries
            state.overviews[dbIndex].queries =
                [
                    ...fList.slice(0, fIndex),
                    ...fList.slice(fIndex + 1, fList.length)
                ] as [QueryForageItem, ...QueryForageItem[]]

            queryForage.removeItem(action.payload.id)
            
        },
        renameFile: (state, action: PayloadAction<{ id: string, newName: string }>) => {

        }
    }
})


export const {
    setOverviews,
    deleteFile,
} = overviewSlicer.actions


export const initOverviewAsync = () => (
    async (dispatch: ThunkDispatch<RootState, null, AnyAction>, getState: any) => {
        const database = await initDatabase();
        const overviews = await getFileOverviews(database);
        dispatch(setOverviews(overviews));
    }
)



export const createNewFileAsync = (
    fileId: string,
    dataSourceId: string,
    queryName: string,
) => (
    async (dispatch: ThunkDispatch<RootState, null, AnyAction>, getState: any) => {
        const dataSource = await dataSourceForage.getItem<DataSourceForageItem>(dataSourceId);
        if (dataSource) {
            const createTime = new Date().getTime();
            dispatch(nodeRenewal({ ids: [], entities: {} }))
            dispatch(edgeRenewal({ ids: [], entities: {} }))
            dispatch(constraintRenewal({ ids: [], entities: {} }))
            dispatch(
                applyFileToWorkspace({
                    model: null,
                    editMode: EditMode.CreatingNode,
                    projectName: dataSource.name,
                    workspaceName: queryName,
                    createTime: createTime,
                    lastModifiedTime: createTime,
                    dataSourceId: dataSourceId,
                    fileId,
                })
            )
            const schema = await fetchSchema()
            dispatch(setModelBySchema(schema))
        }
    }
)


export const loadFileAsync = (
    fileId: string,
    onFileLoaded: (file: QueryForageItem) => void,
) => (
    async (dispatch: ThunkDispatch<RootState, null, AnyAction>, getState: any) => {
        const file = await queryForage.getItem<QueryForageItem>(fileId);

        if (file) {
            const dataSource = await dataSourceForage.getItem<DataSourceForageItem>(file.dataSourceId);

            dispatch(nodeRenewal(file.nodes))
            dispatch(edgeRenewal(file.edges))
            dispatch(constraintRenewal(file.constraints))

            dispatch(
                applyFileToWorkspace({
                    model: null,
                    editMode: EditMode.CreatingNode,
                    projectName: dataSource?.name ?? "ERROR DATABASE",
                    workspaceName: file.name,
                    createTime: file.createTime,
                    lastModifiedTime: file.lastEditTime,
                    dataSourceId: file.dataSourceId,
                    fileId,
                })
            )
            const schema = await fetchSchema()
            dispatch(setModelBySchema(schema))
            onFileLoaded(file)
        }
    }
)


export const tryImportFileAsync = (file: QueryForageItem, onLoaded: () => void) =>
(
    async (dispatch: ThunkDispatch<RootState, null, AnyAction>, getState: any) => {

        queryForage.setItem(file.id, file)

        const dataSource = await dataSourceForage.getItem<DataSourceForageItem>(file.dataSourceId);

        dispatch(nodeRenewal(file.nodes))
        dispatch(edgeRenewal(file.edges))
        dispatch(constraintRenewal(file.constraints))

        dispatch(
            applyFileToWorkspace({
                model: null,
                editMode: EditMode.CreatingNode,
                projectName: dataSource?.name ?? "ERROR DATABASE",
                workspaceName: file.name,
                createTime: file.createTime,
                lastModifiedTime: file.lastEditTime,
                dataSourceId: file.dataSourceId,
                fileId: file.id,
            })
        )
        onLoaded()
        const schema = await fetchSchema()
        dispatch(setModelBySchema(schema))
    }
)

export const overviewSelectors = (state: RootState) => state.overview.overviews;


export default overviewSlicer.reducer