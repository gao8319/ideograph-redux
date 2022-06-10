import {
    createEntityAdapter,
    createSlice,
    EntityState,
    PayloadAction,
} from '@reduxjs/toolkit'
import { IPatternNode } from '../../utils/common/graph'
import { RootState } from '../store'

const nodesAdapter = createEntityAdapter<IPatternNode>({
    selectId: n => n.id
})


/**
 * 存储当前编辑中的查询的所有 node
 */
const nodesSlicer = createSlice({
    name: 'nodes',
    initialState: nodesAdapter.getInitialState(),
    reducers: {
        // Can pass adapter functions directly as case reducers.  Because we're passing this
        // as a value, `createSlice` will auto-generate the `bookAdded` action type / creator
        addNode: nodesAdapter.addOne,
        modifyNode: nodesAdapter.updateOne,
        deleteNode: nodesAdapter.removeOne,

        renewal(state, actions: PayloadAction<EntityState<IPatternNode>>) {
            state.ids = actions.payload.ids;
            state.entities = actions.payload.entities;
        }
    },
})



export const { addNode, modifyNode, deleteNode, renewal: nodeRenewal } = nodesSlicer.actions

export const nodesSelectors = nodesAdapter.getSelectors((state: RootState) => state.nodes)

export default nodesSlicer.reducer
