import { useEffect, useMemo, useRef } from "react"
import { PatternGraphEngine, RaiseMessageCallback } from "../engine/PatternGraphEngine";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addEdge } from "../store/slice/edgeSlicer";
import { editModeSelector, editPayloadSelector, elementConstraintsSelector, focusElementSelector, setEditModeWithPayload, setEditPayloadDangerously, setFocus, workspaceSelector } from "../store/slice/modelSlicer";
import { addNode } from "../store/slice/nodeSlicer";
import { CommonModel } from "./common/model"
import { isNotEmpty } from "./common/utils";

export const usePatternEngine = (
    modelObject: CommonModel.ISerializedRoot,
    raiseMessage: RaiseMessageCallback,
    deps?: React.DependencyList,
) => {

    // Cache model instance
    const modelInstance = useMemo(
        () => {
            return CommonModel.deserializeFromObject(modelObject)
        }, [modelObject]
    )

    const containerRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<PatternGraphEngine>();
    const dispatch = useAppDispatch();
    const editMode = useAppSelector(editModeSelector);
    const editPayload = useAppSelector(editPayloadSelector);


    useEffect(() => {
        if (containerRef.current) {
            const engine = new PatternGraphEngine(
                modelInstance,
                containerRef.current
            );
            engine.setFocusedElementChangedCallback(ele => {
                if (ele) {
                    dispatch(setFocus({
                        type: ele.elementType,
                        payload: ele.asObject(),
                    }))
                }
                // const eleType = ele?.elementType
                // if (eleType === VisualElementType.Node) {
                //     const payload = {
                //         id: (ele as PatternNode).uuid,
                //         constraints: [],
                //         position: { x: 0, y: 0 },
                //         class: (ele as PatternNode).ontologyClass
                //     }
                //     dispatch(setFocus({
                //         type: eleType,
                //         payload:  ele!.asObject(),
                //     }))
                // }
                // else if (eleType === VisualElementType.Edge) {
                //     // const payload = {
                //     //     id: (ele as PatternEdge).uuid,
                //     //     from: (ele as PatternEdge).from.uuid,
                //     //     to: (ele as PatternEdge).to.uuid,
                //     //     class: {
                //     //         from: (ele as PatternEdge).from.
                //     //     },
                //     //     constraints: [],
                //     //     direction: EdgeDirection.Specified,
                //     // }

                //     dispatch(setFocus({
                //         type: eleType,
                //         payload: ele!.asObject(),
                //     }))
                // }
                else {
                    dispatch(setFocus(undefined));
                }
            });
            engine.setOnNodeCreatedCallback(n => {
                dispatch(addNode(n));
                dispatch(setEditPayloadDangerously(undefined))
            })
            engine.setOnEdgeCreatedCallback(e => {
                dispatch(addEdge(e));
                dispatch(setEditPayloadDangerously(undefined))
            })
            engine.setRaiseMessageCallback(raiseMessage)
            // engine.setOnConstraintCreatedCallback(c => dispatch(addConstraint(c)))





            engineRef.current = engine;
            return () => {
                engine.detach();
                engineRef.current = undefined;
            }
        }
    }, deps)

    useEffect(() => {
        if (engineRef.current) {
            engineRef.current.editPayload = isNotEmpty(editPayload) ? editPayload! : null;
            engineRef.current.editMode = editMode;
        }
    }, [editMode, editPayload, engineRef])

    const elementConstraints = useAppSelector(elementConstraintsSelector);
    const focusElement = useAppSelector(focusElementSelector);
    useEffect(() => {
        if (focusElement) {
            engineRef.current?.notifyElementConstrained(
                focusElement,
                elementConstraints.length > 0
            );
        }
    }, [elementConstraints, engineRef])


    return {
        engineRef,
        containerRef
    }
}