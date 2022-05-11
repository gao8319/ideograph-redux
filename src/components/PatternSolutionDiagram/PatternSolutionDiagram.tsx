import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Solution } from "../../services/PatternSolution"
import { useAppSelector } from "../../store/hooks"
import { edgesSelectors } from "../../store/slice/edgeSlicer"
import { nodesSelectors } from "../../store/slice/nodeSlicer"
import { SolutionDiagramCore } from "./SolutionDiagramCore"
import './SolutionDiagram.css'
import AutoSizer from "react-virtualized-auto-sizer";


import { FixedSizeList as List } from 'react-window'
import _ from "lodash"
import React from "react"
import { Callout, DirectionalHint } from "@fluentui/react"
import { ideographDarkTheme } from "../../utils/ideographTheme"
import { useStateWithHistory } from "react-use"
interface ISolutionDiagramProps {
    onPaint: (svg: SVGGElement, setCallouProps: (prop?: [SVGElement, Solution.WorkspaceEdge | Solution.WorkspaceNode]) => void) => (() => void),
    style?: React.CSSProperties;
    onCopy: () => void;
}

interface ISolutionDiagramGridViewProps {
    solutions: Solution.PatternSolution[],
    columnCount: number,
}


const SolutionDiagram = (
    props: ISolutionDiagramProps,
) => {
    const svgRef = useRef<SVGGElement>(null);

    const [calloutProps, setCallouProps] = useStateWithHistory<[SVGElement, Solution.WorkspaceEdge | Solution.WorkspaceNode]>();

    // const setCalloutProps = useCallback(() => {

    // }, setCall)

    useEffect(() => {
        if (svgRef.current) {
            return props.onPaint(svgRef.current, _.debounce(setCallouProps, 300));
        }
    }, [props.onPaint, svgRef])



    return <div>
        <svg width={320} height={240} style={{ backgroundColor: '#f8f9fa', borderRadius: 3 }} >
            <g ref={svgRef} />
            <g className="hover-only" onClick={() => {
                props.onCopy();
            }}>
                <rect x={248} y={215} width={68} height={22} fill="#20222a" rx={2} ry={2} />
                <text style={{

                    textAnchor: 'end',
                    pointerEvents: 'none',
                    fill: '#fff',
                    fontSize: 12,
                }}
                    x={310}
                    y={230}>
                    复制 JSON
                </text>
            </g>
        </svg>
        {calloutProps && <Callout
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
        </Callout>}
    </div>
}

export const SolutionDiagramGridView = (
    props: ISolutionDiagramGridViewProps
) => {
    // const modal = useAppSelector(modelSelector);
    const nodes = useAppSelector(nodesSelectors.selectAll);
    const edges = useAppSelector(edgesSelectors.selectAll);

    const core = useMemo(() => new SolutionDiagramCore(
        nodes,
        edges,
    ), [props.solutions])

    const chunckedSolutions = React.useMemo(
        () => _.chunk(props.solutions, 4), [
        props.solutions
    ])


    return <>
        <AutoSizer>
            {({ height, width }) => (<List itemSize={256}
                itemCount={chunckedSolutions.length}
                height={height}
                width={width}>
                {
                    (item) => <div
                        key={item.index}
                        style={{ display: 'grid', gridTemplateColumns: `repeat(${props.columnCount}, 320px)`, paddingLeft: 16, paddingRight: 16, columnGap: 16, ...item.style }}
                    >
                        {
                            chunckedSolutions[item.index].map(
                                it => <SolutionDiagram style={item.style}
                                    onPaint={(svg, prop) => {
                                        return core.paintOn(svg, it, prop)
                                    }}

                                    onCopy={
                                        () => {
                                            navigator.clipboard.writeText(
                                                JSON.stringify(it, null, '    ')
                                            ).then(
                                                () => alert("复制成功。")
                                            )

                                        }
                                    }
                                />
                            )
                        }
                    </div>
                }
            </List>)}
        </AutoSizer>

    </>
}