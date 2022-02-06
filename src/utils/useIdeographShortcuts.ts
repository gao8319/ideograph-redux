import { useEffect } from "react";
import { useKey, useKeyPress, useKeyPressEvent } from "react-use"
import { EditMode } from "../engine/visual/EditMode";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { applyQuery, editModeSelector, setEditMode } from "../store/slice/modelSlicer";

export const useIdeographShortcuts = (

) => {
    const dispatch = useAppDispatch();
    const editMode = useAppSelector(editModeSelector)

    const controlPressed = useKeyPress('Meta')[0]

    useKey('v', e => {
        if((e.target as HTMLElement))
        dispatch(setEditMode(EditMode.Default))
    }, { event: 'keypress', target: window }, [editMode]);

    useKey('n', e => {
        dispatch(setEditMode(EditMode.CreatingNode))
    }, { event: 'keypress', target: window }, [editMode]);

    useKey('e', e => {
        dispatch(setEditMode(EditMode.CreatingEdgeFrom))
    }, { event: 'keypress', target: window }, [editMode]);

    useKey('i', e => {
        // edit
        // dispatch()
    });

    useKey('Enter', e => {
        if (controlPressed) {
            dispatch(applyQuery())
        }
    }, { event: 'keydown', target: window }, [controlPressed]);
}