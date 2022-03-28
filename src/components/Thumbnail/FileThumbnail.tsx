import { useEffect, useRef } from "react"
import { IPatternEdge, IPatternNode } from "../../utils/common/graph";
import { QueryForageItem } from "../../utils/global/Storage"
import { SolutionDiagramCore } from "../PatternSolutionDiagram/SolutionDiagramCore";

interface IFileThumbnailProps {
    file: QueryForageItem
}


export const FileThumbnail = (props:
    IFileThumbnailProps
) => {

    const svgRef = useRef<SVGSVGElement>(null);
    useEffect(() => {
        if (svgRef.current) {
            const core = new SolutionDiagramCore(
                Object.values(props.file.nodes.entities) as IPatternNode[],
                Object.values(props.file.edges.entities) as IPatternEdge[],
                { width: 280, height: 112 },
                18
            )
            const dispose = core.paintOnUnsolved(svgRef.current)
            return dispose;
        }
    }, [svgRef])
    return <svg ref={svgRef} width={280} height={112} />
}