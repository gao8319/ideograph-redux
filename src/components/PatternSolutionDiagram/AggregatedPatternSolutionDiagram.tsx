import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Solution } from "../../services/PatternSolution"
import { useAppSelector } from "../../store/hooks"
import { edgesSelectors } from "../../store/slice/edgeSlicer"
import { nodesSelectors } from "../../store/slice/nodeSlicer"
import { SolutionDiagramCore } from "./SolutionDiagramCore"
import './SolutionDiagram.css'
import AutoSizer from "react-virtualized-auto-sizer";


import { FixedSizeList as List } from 'react-window'
import _, { debounce } from "lodash"
import React from "react"
import { Callout, DirectionalHint } from "@fluentui/react"
import { ideographDarkTheme } from "../../utils/ideographTheme"
import { useStateWithHistory } from "react-use"
import { ForceDirectedSolutionDiagram } from "./ForceDirectedSolutionDiagram"
import { modelSelector, workspaceSelector } from "../../store/slice/modelSlicer"
import { createPortal } from "react-dom"
import { StyledButton, StyledDefaultButton, StyledDefaultButton2 } from "../Styled/StyledComponents"
import { pangu } from "../../utils/common/pangu"
import FileSaver from "file-saver"
interface ISolutionDiagramProps {
    onPaint: (svg: SVGGElement, setCallouProps: (prop?: [SVGElement, Solution.WorkspaceEdge | Solution.WorkspaceNode]) => void) => (() => void),
    style?: React.CSSProperties;
    onCopy: () => void;
}

interface IAggregatedSolutionDiagramGridViewProps {
    solutions: Solution.AggregatedPatternSolution[],
    columnCount: number,
}

const FDSolutionRenderer = (props: {
    // onRender: (svgRef: SVGSVGElement) => void
    coreRef: ForceDirectedSolutionDiagram,
    index: number,
}) => {


    const [calloutProps, setCallouProps] = useStateWithHistory<[SVGElement, Solution.WorkspaceEdge | Solution.WorkspaceNode]>();

    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (svgRef.current) {
            props.coreRef.attachTo(svgRef.current, props.index, debounce(setCallouProps, 300))

        }
    }, [svgRef])

    return <>
        <div style={{ width: 320, height: 240, position: 'relative' }} className="grid-hover">
            <svg ref={svgRef} width={320} height={240} style={{ borderRadius: 3, backgroundColor: 'var(--grey50)' }} />

            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 8, padding: 8, position: 'absolute', bottom: 0 }}>
                <StyledDefaultButton2 onClick={ev => {
                    var blob = new Blob([JSON.stringify({
                        pattern: props.coreRef.pattern,
                        data: props.coreRef.solutions[props.index]
                    })], { type: "text/plain;charset=utf-8" });
                    FileSaver.saveAs(blob, `子图检索结果-${new Date().toISOString()}.json`);
                }}>
                    {pangu.spacing("导出JSON")}
                </StyledDefaultButton2>
                <StyledButton onClick={ev => {
                    if (top && top !== window) {
                        postMessage({
                            pattern: props.coreRef.pattern,
                            data: props.coreRef.solutions[props.index]
                        })
                    }
                }}>
                    查看详情
                </StyledButton>
            </div>
        </div>
        {
            createPortal(<> {calloutProps && <Callout
                target={calloutProps[0]}
                directionalHint={DirectionalHint.bottomCenter}
                onDismiss={ev => setCallouProps(undefined)}
                preventDismissOnEvent={ev => {
                    if (ev instanceof MouseEvent)
                        return true;
                    return false;
                }}
                theme={ideographDarkTheme}
                calloutMaxWidth={360}
                styles={{
                    calloutMain: {
                        borderRadius: 0,
                        padding: '8px 0'
                    }
                }}>

                <div className='contextual-callout-item'
                    style={{ pointerEvents: 'none', fontSize: 13, fontWeight: 500, padding: '24px 16px' }}>
                    {
                        calloutProps[1].name
                    }
                </div>

                <div className='contextual-callout-item'
                    style={{ pointerEvents: 'none', height: 'auto', display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 8, padding: 0 }}>
                    {
                        Object.entries(calloutProps[1].properties).map(
                            it => <>
                                <div className='contextual-callout-sep' style={{ gridColumn: '1 / 3' }} />
                                <div style={{ fontWeight: 600, padding: '0 0 0 16px', minWidth: 72 }}>
                                    {it[0]}
                                </div>
                                <div style={{ padding: '0 16px 0 0' }}>
                                    {it[1]}
                                </div>
                            </>
                        )
                    }
                </div>
            </Callout>}</>, document.body)
        }
    </>
}

export const AggregatedSolutionDiagramGridView = (
    props: IAggregatedSolutionDiagramGridViewProps
) => {
    const model = useAppSelector(modelSelector);

    const core = useMemo(() => new ForceDirectedSolutionDiagram(props.solutions, model), [props.solutions, model])


    return <>
        <AutoSizer>
            {({ height, width }) => (<List itemSize={256}
                itemCount={core.getSolutionSize()}
                height={height}
                width={width}>
                {
                    (item) => {
                        return <div
                            key={item.index}
                            style={{ display: 'grid', gridTemplateColumns: `repeat(${props.columnCount}, 320px)`, paddingLeft: 16, paddingRight: 16, columnGap: 16, ...item.style }}
                        >
                            {
                                new Array(4).fill(0).map((_, index) => {
                                    const i = 4 * item.index + index;
                                    if (i < core.solutions.length) {
                                        return <FDSolutionRenderer
                                            key={i}
                                            coreRef={core}
                                            index={i}
                                        />
                                    }
                                })
                            }

                        </div>
                    }
                }
            </List>)}
        </AutoSizer>

    </>
}