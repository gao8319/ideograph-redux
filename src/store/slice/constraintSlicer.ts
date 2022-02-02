import {
    createEntityAdapter,
    createSlice,
} from '@reduxjs/toolkit'
import { ConstrainableElement, IConstraint, IPatternConstraint, IPatternEdge, IPatternNode } from '../common/graph'
import { RootState } from '../store'

const constraintsAdapter = createEntityAdapter<IPatternConstraint<ConstrainableElement>>({
    selectId: c => c.id
})

const constraintsSlicer = createSlice({
    name: 'constraint',
    initialState: constraintsAdapter.getInitialState(),
    reducers: {
        addConstraint: constraintsAdapter.addOne,
        modifyConstraint: constraintsAdapter.updateOne,
        deleteConstraint: constraintsAdapter.removeOne,
    },
})

export const { modifyConstraint, deleteConstraint, addConstraint } = constraintsSlicer.actions

export const constraintsSelectors = constraintsAdapter.getSelectors((state: RootState) => state.constraints)

export default constraintsSlicer.reducer