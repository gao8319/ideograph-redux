import { Close20, Warning16 } from "@carbon/icons-react";
import { Skeleton } from "@mui/material";
import _ from "lodash";
import { Dictionary } from "lodash";
import { useEffect, useState } from "react";
import { PatternEdge } from "../../engine/visual/PatternEdge";
import { PatternGroup } from "../../engine/visual/PatternGroup";
import { PatternNode } from "../../engine/visual/PatternNode";
import { Solution } from "../../services/PatternSolution";
import { AggregatedSolvePatternResponse, querySolveCompositePattern, querySolveCompositePatternWithAggregation, SolvePatternResponse } from "../../services/SolvePattern";
import { useAppDispatch, useAppSelector } from "../../store/hooks"
import { constraintsSelectors } from "../../store/slice/constraintSlicer";
import { edgesSelectors } from "../../store/slice/edgeSlicer";
import { applyQuery } from "../../store/slice/modelSlicer";
import { nodesSelectors } from "../../store/slice/nodeSlicer";
import { pangu } from "../../utils/common/pangu";
import { PatternHistoryForageItem } from "../../utils/global/Storage";
import { IConstraintContext, IdeographAggregatePatternContext } from "../../utils/PatternContext";
import { ActionButtonTiny } from "../Panels/common/ActionButton";
import { PanelTitle } from "../Panels/common/PanelTitle";
import { AggregatedSolutionDiagramGridView } from "../PatternSolutionDiagram/AggregatedPatternSolutionDiagram";
import { SolutionDiagramGridView } from "../PatternSolutionDiagram/PatternSolutionDiagram";

interface IAggergateQueryModalProps {
    getConstraintContext: () => Omit<IConstraintContext, "constraints"> | null,
    getStructureContext: () => {
        nodes: Dictionary<PatternNode>;
        edges: Dictionary<PatternEdge>;
        groups: Dictionary<PatternGroup>;
    },
    onSaveHistory: (history: PatternHistoryForageItem) => void;
}

enum PatternQueryStatus {
    ValidatingInput = 0,
    SendingRequest = 1,
    SolvingResponse = 2
}

export const AggregateQueryModal = (props: IAggergateQueryModalProps) => {
    const dispatch = useAppDispatch();
    const nodes = useAppSelector(nodesSelectors.selectAll);
    const edges = useAppSelector(edgesSelectors.selectAll);
    const constraints = useAppSelector(constraintsSelectors.selectAll);

    const [status, setStatus] = useState(PatternQueryStatus.ValidatingInput);

    const [solutions, setSolutions] = useState<AggregatedSolvePatternResponse>();


    const [warningMessage, setWarningMessage] = useState<string>();

    useEffect(
        () => {
            const partialConstraintContext = props.getConstraintContext();
            const structureContext = props.getStructureContext();

            const ipc = partialConstraintContext ?
                new IdeographAggregatePatternContext(structureContext, {
                    constraints: constraints,
                    connections: partialConstraintContext.connections,
                    logicOperators: partialConstraintContext.logicOperators
                }) :
                new IdeographAggregatePatternContext(structureContext, {
                    constraints: [],
                    connections: [],
                    logicOperators: []
                });

            setStatus(PatternQueryStatus.ValidatingInput)


            ipc.buildCoreContext().then(
                async (context) => {

                    // TODO: emit warnings.

                    setStatus(PatternQueryStatus.SendingRequest)
                    // const sol = await querySolvePattern(pattern);
                    const compositePattern: Solution.CompositePatternWithAggregation = {
                        connections: partialConstraintContext?.connections ?? [],
                        logicOperators: partialConstraintContext?.logicOperators.map(
                            it => ({ patternId: it.id, type: Solution.LogicOperator2Literal[it.type] })
                        ) ?? [],
                        nodes: context.nodes,
                        edges: context.edges,
                        constraints: context.constraints,
                        aggregations: context.aggregations ?? []
                    }

                    // if (top && top !== window) {
                    //     top.postMessage(compositePattern)
                    // }
                    // else {
                    const compositeSolution = await querySolveCompositePatternWithAggregation(
                        compositePattern
                    )
                    // props.onSaveHistory({ ...compositeSolution, queryTimestamp: new Date().getTime() });
                    setSolutions(compositeSolution)
                    setStatus(PatternQueryStatus.SolvingResponse);
                    // }

                }
            )
        }, [nodes, edges, constraints, props.getConstraintContext]
    )


    return <><div style={{ left: 0, top: 0, width: '100vw', height: '100vh', backgroundColor: '#20222a60', fontSize: 14, position: 'absolute', zIndex: 99998, }}></div>
        <div style={{ left: 'calc(50vw - 680px)', top: '14vh', width: '1360px', height: '72vh', backgroundColor: '#fff', fontSize: 14, padding: 0, position: 'absolute', zIndex: 99999, boxShadow: 'rgba(0, 0, 0, 0.133) 0px 6.390625px 14px 0px, rgba(0, 0, 0, 0.11) 0px 1.1875px 3px 0px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '8px', }}>
                <div style={{ display: 'flex', color: '#000' }}>
                    <PanelTitle text={
                        status == PatternQueryStatus.ValidatingInput ? "正在解析约束"
                            : status == PatternQueryStatus.SendingRequest ? "正在查询"
                                : `查询到${_.sumBy(solutions?.solutions, (it => it.solution.length))}个匹配, 查询数据库用时${solutions?.elapsedTimeInMillis}ms`
                    } topUnpadded />
                </div>
                <div style={{ display: 'flex' }}>
                    <ActionButtonTiny onClick={ev => dispatch(applyQuery(false))}>
                        <Close20 />
                    </ActionButtonTiny>
                </div>
            </div>
            {solutions !== undefined && <div style={{ fontFamily: 'var(--mono-font)', color: '#fff', height: 'calc(72vh - 56px)', overflowY: 'auto' }}>
                <AggregatedSolutionDiagramGridView solutions={solutions.solutions} columnCount={4} />
            </div>}
            {
                status == PatternQueryStatus.SendingRequest && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 320px)', columnGap: 16, padding: '0 16px', rowGap: 16, overflow: 'hidden', height: 'calc(72vh - 56px)', }}>
                    {
                        new Array(12).fill(0).map(_ => {
                            return <Skeleton variant="rectangular" width={320} height={240} style={{ borderRadius: 0, backgroundColor: '#f1f2f4' }} animation="wave" />
                        })
                    }
                </div>
            }
            {warningMessage && <div style={{
                position: 'absolute', bottom: 0, height: 36, fontSize: 12,
                display: 'flex', alignItems: 'center', width: '100%',
                padding: '0 16px', columnGap: 8, background: 'rgb(208,82,32)', color: '#fff'
            }}>
                <Warning16 fill="#fff" />
                {pangu.spacing(warningMessage)}
            </div>}
        </div>
    </>
}