import {
    createEntityAdapter,
    createSlice,
} from '@reduxjs/toolkit'
import { IPatternNode } from '../common/graph'
import { RootState } from '../store'

const nodesAdapter = createEntityAdapter<IPatternNode>({
    selectId: n => n.id
})

const nodesSlicer = createSlice({
    name: 'nodes',
    initialState: nodesAdapter.getInitialState(),
    reducers: {
        // Can pass adapter functions directly as case reducers.  Because we're passing this
        // as a value, `createSlice` will auto-generate the `bookAdded` action type / creator
        addNode: nodesAdapter.addOne,
        modifyNode: nodesAdapter.updateOne,
        deleteNode: nodesAdapter.removeOne,

    },
})

export const { addNode, modifyNode, deleteNode } = nodesSlicer.actions

export const nodesSelectors = nodesAdapter.getSelectors((state: RootState) => state.nodes)

export default nodesSlicer.reducer
