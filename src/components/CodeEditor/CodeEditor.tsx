import { useEffect, useRef, useState } from "react"
import * as monaco from 'monaco-editor'
import { useAppSelector } from "../../store/hooks";
import { nodesSelectors } from "../../store/slice/nodeSlicer";
import { edgesSelectors } from "../../store/slice/edgeSlicer";
import { constraintsSelectors } from "../../store/slice/constraintSlicer";
import { pangu } from "../../utils/common/pangu";
import { Warning16, Warning20 } from "@carbon/icons-react";
import Color from "color";
import React from "react";
import { IConstraintContext, IdeographPatternContext, IPatternContext } from "../../utils/PatternContext";
import { IdeographIR } from "../../utils/IR";

export interface ICodeEditorProps {
    getConstraintContext: () => Omit<IConstraintContext, "constraints"> | null
}



/**
 * 显示生成的 JSON
 * @param props ·
 * @returns 
 */
export const CodeEditor = (
    props: ICodeEditorProps
) => {
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
    const nodes = useAppSelector(nodesSelectors.selectAll);
    const edges = useAppSelector(edgesSelectors.selectAll);
    const constraints = useAppSelector(constraintsSelectors.selectAll);

    const [warningMessage, setWarningMessage] = useState<string>();

    useEffect(
        () => {
            const partialConstraintContext = props.getConstraintContext();
            const ipc = partialConstraintContext ?
                new IdeographPatternContext(nodes, edges, {
                    constraints: constraints,
                    connections: partialConstraintContext.connections,
                    logicOperators: partialConstraintContext.logicOperators
                }) :
                new IdeographPatternContext(nodes, edges, {
                    constraints: [],
                    connections: [],
                    logicOperators: []
                });
            ipc.generatePrunnedPattern().then(
                pattern => {
                    // emit warnings
                    if (
                        (ipc.maxSubgraphNodeCount !== undefined
                            && ipc.maxSubgraphNodeCount < ipc.nodes.length)
                        || ((ipc.maxSubgraphConstraintTreeCount ?? 0) > 1)
                    ) {
                        const propertyWarning = ipc.maxSubgraphConstraintTreeCount
                            ? (
                                `这些属性约束中包含${ipc.maxSubgraphConstraintTreeCount
                                }颗独立的逻辑树`
                                + (ipc.maxSubgraphConstraintTreeCount > 1
                                    ? "，它们将被以「与」逻辑运算符连接。"
                                    : "。"
                                )
                            ) : "";
                        setWarningMessage(
                            `生成的语句仅包含最大连通子图中的${ipc.maxSubgraphNodeCount
                            }个节点、${ipc.maxSubgraphEdgeCount}条边和仅针对它们的属性约束。`
                            + propertyWarning
                        )
                    }

                    // ir && 
                    editorRef.current?.setValue(
                        JSON.stringify(pattern, null, "    ")
                        // IdeographIR.IR2Cypher(pattern)
                    );
                }
            )
        }, [nodes, edges, constraints, props.getConstraintContext]
    )

    useEffect(() => {
        if (!editorContainerRef.current) return;

        var model = monaco.editor.createModel(
            "", "json"
        );

        var editor = monaco.editor.create(editorContainerRef.current, {
            model: model,
            language: 'json',
            fontFamily: '"SFMono", ui-monospace, monospace',
            fontSize: 16,
            theme: 'vs-dark',
            // readOnly: true,
        });

        editorRef.current = editor;
        return () => {
            editorRef.current = undefined;
            editor.dispose();
        }
    }, [editorContainerRef]);



    useEffect(() => {
        const editorContainer = editorContainerRef.current;
        if (editorContainer) {
            const ro = new ResizeObserver(entries => {
                const r = entries[0].contentRect
                editorRef.current?.layout(r)
            })
            ro.observe(editorContainer)
            return () => {
                ro.unobserve(editorContainer);
            }
        }
    }, [editorContainerRef])



    return <div style={{ width: '100%', height: 'calc(100% - 56px)', position: 'relative',  }}>
        <div ref={editorContainerRef} style={{ width: '100%', height: '100%' }} />
        {warningMessage && <div style={{
            position: 'absolute', bottom: 0, height: 36, fontSize: 12, 
            display: 'flex', alignItems: 'center', width: '100%',
            padding: '0 16px', columnGap: 8, background: 'rgb(208,82,32)', color: '#fff'
        }}>
            <Warning16 fill="#fff" />
            {pangu.spacing(warningMessage)}
        </div>}

    </div>
}