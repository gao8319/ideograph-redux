import { useEffect, useMemo, useRef } from "react"
import { Solution } from "../../services/PatternSolution"
import { useAppSelector } from "../../store/hooks"
import { edgesSelectors } from "../../store/slice/edgeSlicer"
import { nodesSelectors } from "../../store/slice/nodeSlicer"
import { SolutionDiagramCore } from "./SolutionDiagramCore"
import './SolutionDiagram.css'

interface ISolutionDiagramProps {
    onPaint: (svg: SVGSVGElement) => (() => void)
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
        if(svgRef.current) {
            return props.onPaint(svgRef.current);
        }
    }, [props.onPaint, svgRef])
    return <svg ref={svgRef} width={320} height={240} style={{backgroundColor: '#f8f9fa' }}/>
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

    return <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${props.columnCount},${320}px)`,
        rowGap: 16,
        columnGap: 16,
        padding: 16,
        paddingTop: 0,
    }}>
        {
            props.solutions.map(
                sol => <SolutionDiagram onPaint={svg => {
                    return core.paintOn(svg, sol)
                }} />
            )
        }
    </div>
}