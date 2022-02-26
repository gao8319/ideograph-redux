import { useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useKey, useKeyPress, useKeyPressEvent } from "react-use"
import { EditMode } from "../engine/visual/EditMode";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { applyQuery, editModeSelector, exportToJson, setEditMode } from "../store/slice/modelSlicer";


export const useShortcutSet = () => {
    const dispatch = useAppDispatch();
    const editMode = useAppSelector(editModeSelector);

    useHotkeys(
        'v',
        e => {
            dispatch(setEditMode(EditMode.Default))
        }
    );

    useHotkeys(
        'o',
        e => {
            dispatch(setEditMode(EditMode.CreatingNode))
        }
    )

    useHotkeys(
        'l',
        e => {
            dispatch(setEditMode(EditMode.CreatingEdgeFrom))
        }
    )

    useHotkeys(
        'ctrl+s',
        e => {
            dispatch(applyQuery())
        }
    )

    useHotkeys(
        'ctrl+e',
        e => {
            dispatch(exportToJson())
        }
    )


}

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