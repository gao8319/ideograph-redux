import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { askGraphModel } from "../../utils/AskGraph";
import { convertAskGraphOntModel } from "../../utils/AskGraphConverter";
import { CommonModel } from "../../utils/common/model";
import { RootState } from "../store";

type ModelState = {
    serializedModel: CommonModel.ISerializedRoot,
}

const initialState = {
    serializedModel: convertAskGraphOntModel(askGraphModel)
}

const modelSlicer = createSlice({
    name: 'model',
    initialState,
    reducers: {
        setSerializedModel(state, action: PayloadAction<CommonModel.ISerializedRoot>) {
            state.serializedModel = action.payload
        }
    }
})

export const modelSelector = (state: RootState) => state.model.serializedModel

export default modelSlicer.reducer;