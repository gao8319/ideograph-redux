import { useCallback, useEffect, useRef } from "react"
import { PatternGraphEngine } from "../engine/PatternGraphEngine";
import { PatternEdge } from "../engine/visual/PatternEdge";
import { PatternNode } from "../engine/visual/PatternNode";
import { VisualElementType } from "../engine/visual/VisualElement";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addConstraint } from "../store/slice/constraintSlicer";
import { addEdge } from "../store/slice/edgeSlicer";
import { editModeSelector, editPayloadSelector, setFocus, workspaceSelector } from "../store/slice/modelSlicer";
import { addNode } from "../store/slice/nodeSlicer";
import { EdgeDirection } from "./common/graph";
import { CommonModel } from "./common/model"
import { isNotEmpty } from "./common/utils";



export const usePatternEngine = (
    modelInstance: CommonModel.Root,
    deps?: React.DependencyList | undefined,
) => {
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
                const eleType = ele?.elementType
                if (eleType === VisualElementType.Node) {
                    const payload = {
                        id: (ele as PatternNode).uuid,
                        constraints: [],
                        position: { x: 0, y: 0 },
                        classId: (ele as PatternNode).ontologyClass.id
                    }
                    dispatch(setFocus({
                        type: eleType,
                        payload
                    }))
                }
                else if (eleType === VisualElementType.Edge) {
                    const payload = {
                        id: (ele as PatternEdge).uuid,
                        from: (ele as PatternEdge).from.uuid,
                        to: (ele as PatternEdge).to.uuid,
                        constraints: [],
                        direction: EdgeDirection.Specified,
                    }
                    dispatch(setFocus({
                        type: eleType,
                        payload
                    }))
                }
                else {
                    dispatch(setFocus(undefined));
                }
            });
            engine.setOnNodeCreatedCallback(n => dispatch(addNode(n)))
            engine.setOnEdgeCreatedCallback(e => dispatch(addEdge(e)))
            // engine.setOnConstraintCreatedCallback(c => dispatch(addConstraint(c)))
            engineRef.current = engine;
            return () => {
                engine.detach();
                engineRef.current = undefined;
            }
        }
    }, deps)

    useEffect(() => {
        const engine = engineRef.current;
        if (engine) {
            engine.editPayload = isNotEmpty(editPayload) ? editPayload! : null;
            engine.editMode = editMode;
        }
    }, [editMode, editPayload, engineRef.current])

    return {
        engineRef,
        containerRef
    }
}