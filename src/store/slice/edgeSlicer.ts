import {
    createEntityAdapter,
    createSlice,
} from '@reduxjs/toolkit'
import { IPatternEdge } from '../../utils/common/graph'
import { RootState } from '../store'

const edgesAdapter = createEntityAdapter<IPatternEdge>({
    selectId: e => e.id
})

const edgesSlicer = createSlice({
    name: 'edges',
    initialState: edgesAdapter.getInitialState(),
    reducers: {
        // Can pass adapter functions directly as case reducers.  Because we're passing this
        // as a value, `createSlice` will auto-generate the `bookAdded` action type / creator
        addEdge: edgesAdapter.addOne,
        modifyEdge: edgesAdapter.updateOne,
        deleteEdge: edgesAdapter.removeOne,
    },
})


export const { addEdge, modifyEdge, deleteEdge } = edgesSlicer.actions

export const edgesSelectors = edgesAdapter.getSelectors((state: RootState) => state.edges)

export default edgesSlicer.reducer
