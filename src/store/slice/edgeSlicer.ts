import {
    createEntityAdapter,
    createSlice,
    EntityState,
    PayloadAction,
} from '@reduxjs/toolkit'
import { IPatternEdge } from '../../utils/common/graph'
import { RootState } from '../store'

const edgesAdapter = createEntityAdapter<IPatternEdge>({
    selectId: e => e.id
})
/**
 * 存储当前编辑中的查询的所有 edge
 */
const edgesSlicer = createSlice({
    name: 'edges',
    initialState: edgesAdapter.getInitialState(),
    reducers: {
        // Can pass adapter functions directly as case reducers.  Because we're passing this
        // as a value, `createSlice` will auto-generate the `bookAdded` action type / creator
        addEdge: edgesAdapter.addOne,
        modifyEdge: edgesAdapter.updateOne,
        deleteEdge: edgesAdapter.removeOne,
        renewal(state, actions: PayloadAction<EntityState<IPatternEdge>>) {
            state.ids = actions.payload.ids;
            state.entities = actions.payload.entities;
        }
    },
})


export const { addEdge, modifyEdge, deleteEdge, renewal: edgeRenewal } = edgesSlicer.actions

export const edgesSelectors = edgesAdapter.getSelectors((state: RootState) => state.edges)

export default edgesSlicer.reducer
