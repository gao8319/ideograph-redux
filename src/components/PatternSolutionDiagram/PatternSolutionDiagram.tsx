import { useEffect, useMemo, useRef } from "react"
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
import { Divider } from "@mui/material"

interface ISolutionDiagramProps {
    onPaint: (svg: SVGSVGElement) => (() => void),
    style: React.CSSProperties;
}

interface ISolutionDiagramGridViewProps {
    solutions: Solution.PatternSolution[],
    columnCount: number,
}


const SolutionDiagram = (
    props: ISolutionDiagramProps,
) => {
    const svgRef = useRef<SVGSVGElement>(null);
    useEffect(() => {
        if (svgRef.current) {
            return props.onPaint(svgRef.current);
        }
    }, [props.onPaint, svgRef])
    return <svg ref={svgRef} width={320} height={240} style={{ backgroundColor: '#f8f9fa' }} />
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

    // return <div style={{
    //     display: 'grid',
    //     gridTemplateColumns: `repeat(${props.columnCount},${320}px)`,
    //     rowGap: 16,
    //     columnGap: 16,
    //     padding: 16,
    //     paddingTop: 0,
    // }}>
    //     {
    //         props.solutions.map(
    //             sol => <SolutionDiagram onPaint={svg => {
    //                 return core.paintOn(svg, sol)
    //             }} />
    //         )
    //     }
    // </div>

    return <AutoSizer>
        {({ height, width }) => (<List itemSize={256}
            itemCount={chunckedSolutions.length}
            height={height}
            width={width}>
            {
                (item) => <div style={{ display: 'grid', gridTemplateColumns: `repeat(${props.columnCount}, 320px)`, paddingLeft: 16, paddingRight: 16, columnGap: 16, ...item.style }}>
                    {
                        chunckedSolutions[item.index].map(
                            it => <SolutionDiagram style={item.style} onPaint={svg => {
                                return core.paintOn(svg, it)
                            }} />
                        )
                    }
                </div>
            }
        </List>)}
    </AutoSizer>
}