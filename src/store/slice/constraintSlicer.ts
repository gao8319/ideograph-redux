import {
    createEntityAdapter,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit'
import { VisualElementType } from '../../engine/visual/VisualElement'
import { IConstraint, IPatternEdge, IPatternNode } from '../../utils/common/graph'
import { RootState } from '../store'

const constraintsAdapter = createEntityAdapter<IConstraint>({
    selectId: c => c.id
})

type constraintsAdapterOpType = "addOne" | "updateOne" | "removeOne"; //keyof typeof constraintsAdapter

type constraintsAdapterOpPayload<T extends constraintsAdapterOpType>
    = { payload: (Parameters<(typeof constraintsAdapter[T])>[1]) } & { action: T }

export type ConstraintsState<T extends constraintsAdapterOpType = constraintsAdapterOpType>
    = ReturnType<typeof constraintsAdapter['getInitialState']> & {
        lastOperation?: constraintsAdapterOpPayload<T>
    }

const initialState: ConstraintsState = constraintsAdapter.getInitialState();


/**
 * 存储当前编辑中的查询的所有 constraint
 */
const constraintsSlicer = createSlice({
    name: 'constraint',
    initialState: initialState,
    reducers: {
        addConstraint: (state: ConstraintsState, payload: Parameters<typeof constraintsAdapter['addOne']>[1]) => {
            constraintsAdapter.addOne(state, payload);

        },
        modifyConstraint: (state: ConstraintsState, payload: Parameters<typeof constraintsAdapter['updateOne']>[1]) => {
            constraintsAdapter.updateOne(state, payload);
            state.lastOperation = {
                action: 'updateOne',
                payload
            }
        },
        deleteConstraint: (state: ConstraintsState, payload: Parameters<typeof constraintsAdapter['removeOne']>[1]) => {
            constraintsAdapter.removeOne(state, payload);
            state.lastOperation = {
                action: 'removeOne',
                payload
            }
        },
        renewal(state, actions: PayloadAction<ConstraintsState>) {
            state.ids = actions.payload.ids;
            state.entities = actions.payload.entities;
            state.lastOperation = undefined// actions.payload.lastOperation;
        },
        addConstraintToContext: (state: ConstraintsState, payload: Parameters<typeof constraintsAdapter['addOne']>[1]) => {
            state.lastOperation = {
                action: 'addOne',
                payload
            }
        }
    },
})

export const { modifyConstraint, deleteConstraint, addConstraint, addConstraintToContext, renewal: constraintRenewal } = constraintsSlicer.actions

export const constraintsSelectors = constraintsAdapter.getSelectors((state: RootState) => state.constraints)
export const lastConstraintOperationSelector = (state: RootState) => state.constraints.lastOperation
export default constraintsSlicer.reducer