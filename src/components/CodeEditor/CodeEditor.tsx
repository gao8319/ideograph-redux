import { useEffect, useRef } from "react"
import * as monaco from 'monaco-editor'
import { useAppSelector } from "../../store/hooks";
import { nodesSelectors } from "../../store/slice/nodeSlicer";
import { edgesSelectors } from "../../store/slice/edgeSlicer";
import { constraintsSelectors } from "../../store/slice/constraintSlicer";
import { pangu } from "../../utils/common/pangu";
import { Warning20 } from "@carbon/icons-react";
import Color from "color";
import React from "react";
import { IConstraintContext, IdeographPatternContext, IPatternContext } from "../../utils/PatternContext";
import { IdeographIR } from "../../utils/IR";

export interface ICodeEditorProps {
    getConstraintContext: () => Omit<IConstraintContext, "constraints"> | null
}

export const CodeEditor = (
    props: ICodeEditorProps
) => {
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
    const nodes = useAppSelector(nodesSelectors.selectAll);
    const edges = useAppSelector(edgesSelectors.selectAll);
    const constraints = useAppSelector(constraintsSelectors.selectAll);

    const patternContextIr = React.useMemo(
        async () => {
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
            const ir = await ipc.findLargestConnectedContext();
            ir && editorRef.current?.setValue(IdeographIR.IR2Cypher(ir));
            return ipc;
        }, [nodes, edges, constraints, props.getConstraintContext]
    )

    useEffect(() => {
        if (!editorContainerRef.current) return;
        var model = monaco.editor.createModel(
            JSON.stringify({ nodes, edges, constraints }, null, '    '), "json"
        );
        var editor = monaco.editor.create(editorContainerRef.current, {
            model: model,
            language: 'json',
            fontFamily: '"SFMono", monospace',
            fontSize: 16,
            theme: "vs",
            readOnly: true,
        });
        editorRef.current = editor;
        return () => {
            editorRef.current = undefined;
            editor.dispose();
        }
    }, [editorContainerRef]);




    // useEffect(() => {
    //     patternContext.findLargestConnectedContext();
    // }, [patternContext])



    return <div style={{ width: '100%', height: 'calc(100% - 56px)', position: 'relative' }}>
        <div ref={editorContainerRef} style={{ width: '100%', height: '100%' }} />
        <div style={{
            position: 'absolute', bottom: 0, height: 48, fontSize: 14, display: 'flex', alignItems: 'center', width: '100%',
            borderTop: `1px solid ${(new Color('#fff4ce')).desaturate(0.25).darken(0.1).rgb()}`,
            padding: '0 16px', columnGap: 8, background: '#fff4ce', color: '#8e562e'
        }}>
            <Warning20 fill="#8e562e" />
            {pangu.spacing(`生成的代码中不包含${nodes.length}个孤立节点。`)}
        </div>
    </div>
}