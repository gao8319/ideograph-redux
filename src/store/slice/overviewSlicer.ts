import { AnyAction, createSlice, PayloadAction, ThunkDispatch } from "@reduxjs/toolkit"
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
        }
    }
})


export const {
    setOverviews
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

        }


    }
)


export const tryImportFileAsync = (file: QueryForageItem) =>
(
    async (dispatch: ThunkDispatch<RootState, null, AnyAction>, getState: any) => {


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

        const schema = await fetchSchema()
        dispatch(setModelBySchema(schema))
    }
)

export const overviewSelectors = (state: RootState) => state.overview.overviews;


export default overviewSlicer.reducer