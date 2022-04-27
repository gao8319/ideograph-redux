import { Close20 } from "@carbon/icons-react";
import { Skeleton } from "@mui/material";
import { useEffect, useState } from "react";
import { Solution } from "../../services/PatternSolution";
import { querySolveCompositePattern, querySolvePattern, SolvePatternResponse } from "../../services/SolvePattern";
import { useAppDispatch, useAppSelector } from "../../store/hooks"
import { constraintsSelectors } from "../../store/slice/constraintSlicer";
import { edgesSelectors } from "../../store/slice/edgeSlicer";
import { applyQuery } from "../../store/slice/modelSlicer";
import { nodesSelectors } from "../../store/slice/nodeSlicer";
import { patternHistoryForage, PatternHistoryForageItem } from "../../utils/global/Storage";
import { IConstraintContext, IdeographPatternContext } from "../../utils/PatternContext";
import { ActionButtonTiny, ActionButtonTinyDark } from "../Panels/common/ActionButton";
import { PanelTitle } from "../Panels/common/PanelTitle";
import { SolutionDiagramGridView } from "../PatternSolutionDiagram/PatternSolutionDiagram";

interface IQueryModalProps {
    getConstraintContext: () => Omit<IConstraintContext, "constraints"> | null,
    onSaveHistory: (history: PatternHistoryForageItem) => void;
}

enum PatternQueryStatus {
    ValidatingInput = 0,
    SendingRequest = 1,
    SolvingResponse = 2
}

export const QueryModal = (props: IQueryModalProps) => {
    const dispatch = useAppDispatch();
    const nodes = useAppSelector(nodesSelectors.selectAll);
    const edges = useAppSelector(edgesSelectors.selectAll);
    const constraints = useAppSelector(constraintsSelectors.selectAll);

    const [status, setStatus] = useState(PatternQueryStatus.ValidatingInput);

    const [solutions, setSolutions] = useState<SolvePatternResponse>();


    useEffect(
        () => {
            const partialConstraintContext = props.getConstraintContext();
            console.log(partialConstraintContext)
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

            setStatus(PatternQueryStatus.ValidatingInput)
            ipc.generatePrunnedPattern().then(
                async (pattern) => {

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
                    }
                    setStatus(PatternQueryStatus.SendingRequest)
                    // const sol = await querySolvePattern(pattern);
                    const compositePattern: Solution.CompositePattern = {
                        ...pattern,
                        connections: partialConstraintContext?.connections ?? [],
                        logicOperators: partialConstraintContext?.logicOperators.map(
                            it => ({ patternId: it.id, type: Solution.LogicOperator2Literal[it.type] })
                        ) ?? []
                    }
                    console.log(compositePattern, top)
                    top?.postMessage(compositePattern)
                    const compositeSolution = await querySolveCompositePattern(
                        compositePattern
                    )
                    props.onSaveHistory({ ...compositeSolution, queryTimestamp: new Date().getTime() });
                    // setSolutions(compositeSolution)
                    setStatus(PatternQueryStatus.SolvingResponse);
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
                                : `查询到${solutions?.solutions.length}个匹配, 查询数据库用时${solutions?.elapsedTimeInMillis}ms`
                    } topUnpadded />
                </div>
                <div style={{ display: 'flex' }}>
                    <ActionButtonTiny onClick={ev => dispatch(applyQuery(false))}>
                        <Close20 />
                    </ActionButtonTiny>
                </div>
            </div>
            {solutions !== undefined && <div style={{ fontFamily: 'var(--mono-font)', color: '#fff', height: 'calc(72vh - 56px)', overflowY: 'auto' }}>
                <SolutionDiagramGridView solutions={solutions.solutions} columnCount={4} />
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
        </div>
    </>
}