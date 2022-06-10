import { useEffect, useMemo, useRef } from "react"
import { PatternGraphEngine, RaiseMessageCallback } from "../engine/PatternGraphEngine";
import { VisualElementType } from "../engine/visual/VisualElement";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addEdge } from "../store/slice/edgeSlicer";
import { editModeSelector, editPayloadSelector, elementConstraintsSelector, focusElementSelector, setEditModeWithPayload, setEditPayloadDangerously, setFocus, setModel, workspaceSelector } from "../store/slice/modelSlicer";
import { addNode, nodesSelectors } from "../store/slice/nodeSlicer";
import { CommonModel } from "./common/model";
import { isNotEmpty } from "./common/utils";
import { nameCandidates } from "./NameCandidates";

/**
 * Pattern Engine 钩子函数
 * @param modelObject 本体模型
 * @param raiseMessage 显示不可连接、不能自环等错误消息的回调
 * @param layoutContextMenu 显示顶点右键菜单的回调
 * @param layoutEdgeContextMenu 显示边右键菜单的回调
 * @param layoutSelectionMenu 在多选了元素之后的右键菜单回调
 * @param layoutElementPopup 遇到可能的边的类型有多种时显示的选择对话框
 * @param deps PatternEngine的依赖，变化时会重新构造PatternEngine
 * @returns 
 */
export const usePatternEngine = (
    modelObject: CommonModel.ISerializedRoot | null,
    raiseMessage: RaiseMessageCallback,
    layoutContextMenu: NonNullable<PatternGraphEngine["_onNodeContextMenu"]>,
    layoutEdgeContextMenu: NonNullable<PatternGraphEngine["_onEdgeContextMenu"]>,
    layoutSelectionMenu: NonNullable<PatternGraphEngine["_onSelectionContextMenu"]>,
    layoutElementPopup: NonNullable<PatternGraphEngine["_onEdgeSelectTypeCallback"]>,
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

    /**
     * 在依赖变化时更新 PatternGraphEngine 的实例，
     * 包括：
     *   - 更新本体模型
     *   - 重新绑定所有交互事件
     */
    useEffect(() => {
        if (containerRef.current && modelInstance) {
            const engine = new PatternGraphEngine(
                modelInstance,
                containerRef.current
            );
            engine.setFocusedElementChangedCallback(ele => {
                if (ele &&
                    (ele.elementType == VisualElementType.Node
                        || ele.elementType == VisualElementType.Edge)) {
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
            
            engine.setOnEdgeContextMenu(layoutEdgeContextMenu);
            
            engine.setOnSelectionContextMenu(layoutSelectionMenu);
            engine.setOnEdgeSelectTypeCallback(layoutElementPopup);

            engineRef.current = engine;

            /**
             * 回收 PatternEngineGraph
             */
            return () => {
                engine.detach();
                engineRef.current = undefined;
                dispatch(setModel(null))
            }
        }
    }, deps)


    /**
     * 绑定修改顶点名称的回调
     */
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


    /**
     * 将 PatternGraphEngine 内部的编辑状态暴露出来
     */
    useEffect(() => {
        if (engineRef.current) {
            engineRef.current.editPayload = isNotEmpty(editPayload) ? editPayload! : null;
            engineRef.current.editMode = editMode;
        }
    }, [editMode, editPayload, engineRef])

    /**
     * 将 PatternGraphEngine 内 focus 的元素对应的约束暴露出来
     */
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