import { useEffect, useMemo, useRef } from "react"
import { PatternGraphEngine, RaiseMessageCallback } from "../engine/PatternGraphEngine";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addEdge } from "../store/slice/edgeSlicer";
import { editModeSelector, editPayloadSelector, elementConstraintsSelector, focusElementSelector, setEditModeWithPayload, setEditPayloadDangerously, setFocus, setModel, workspaceSelector } from "../store/slice/modelSlicer";
import { addNode, nodesSelectors } from "../store/slice/nodeSlicer";
import { CommonModel } from "./common/model";
import { isNotEmpty } from "./common/utils";
import { nameCandidates } from "./NameCandidates";

export const usePatternEngine = (
    modelObject: CommonModel.ISerializedRoot | null,
    raiseMessage: RaiseMessageCallback,
    layoutContextMenu: NonNullable<PatternGraphEngine["_onNodeContextMenu"]>,
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

    const nodes = useAppSelector(nodesSelectors.selectAll)

    useEffect(() => {
        if (containerRef.current && modelInstance) {
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

            engine.setOnNodeContextMenu(layoutContextMenu);

            engineRef.current = engine;
            return () => {
                engine.detach();
                engineRef.current = undefined;
                dispatch(setModel(null))
            }
        }
    }, deps)

    useEffect(() => {
        engineRef.current?.setAssignNewName(
            c => {
                const className = c.name;
                const nTh = nodes.filter(n => n.class.id === c.id).length ?? 0
                const index = nameCandidates[nTh] ?? nTh
                return className + index
            }
        )
    }, [engineRef, nodes])


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