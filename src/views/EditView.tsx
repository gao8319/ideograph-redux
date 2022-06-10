import { useCallback, useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { WorkspaceHeader } from '../components/WorkspaceHeader/WorkspaceHeader';
import { clearWorkspace, codeModalSelector, editModeSelector, leftPanelWidthSelector, modelSelector, queryModalSelector, rightPanelWidthSelector, saveFileWorkspace, setCodeModal, setEditMode, setModel, setModelBySchema, workspaceSelector } from '../store/slice/modelSlicer';
// import { useIdeographShortcuts } from '../utils/useIdeographShortcuts';
import { ConceptPanel } from '../components/Panels/ConceptPanel/ConceptPanel';
import { PropertyPanel } from '../components/Panels/PropertyPanel/PropertyPanel';
import { GlobalPanel } from '../components/Panels/GlobalPanel/GlobalPanel';
import { PatternGraphEngine, RaiseMessageCallback, RaiseMessageType } from '../engine/PatternGraphEngine';
import { usePatternEngine } from '../utils/usePatternEngine';
import { Autocomplete, Grow, Input, Modal, PopoverPosition, Snackbar } from '@mui/material';
import { Alert } from '../components/StyledMessage';
import { Close20, Close24, Error20, FitToScreen20, Help20, Maximize16, Maximize20, Scale20 } from '@carbon/icons-react';
import { deleteEdge, edgesSelectors } from '../store/slice/edgeSlicer';
import { ActionButtonTiny, ActionButtonTinyDark } from '../components/Panels/common/ActionButton';
import { CodeEditor } from '../components/CodeEditor/CodeEditor';
import { PanelTitle } from '../components/Panels/common/PanelTitle';
import { GlobalPanelContent, IGlobalPanelContentRef } from '../components/Panels/GlobalPanel/GlobalPanelContent';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchSchema } from '../services/Schema';
import { QueryModal } from '../components/QueryModal/QueryModal';
import { useSearchParam, useTitle } from 'react-use';
import { loadFileAsync } from '../store/slice/overviewSlicer';
import { PatternNode } from '../engine/visual/PatternNode';
import { Callout, DirectionalHint, Tooltip } from '@fluentui/react';
import { ideographDarkTheme } from '../utils/ideographTheme';
import { EditMode } from '../engine/visual/EditMode';
import { getConstraintContextFromQueryForage, patternHistoryForage, QueryForageItem } from '../utils/global/Storage';
import _ from 'lodash';
import { pangu } from '../utils/common/pangu';
import { deleteNode } from '../store/slice/nodeSlicer';
import { constraintsSelectors, deleteConstraint } from '../store/slice/constraintSlicer';
import { IVisualElement, VisualElementType } from '../engine/visual/VisualElement';
import { PatternEdge } from '../engine/visual/PatternEdge';
import { AggregateQueryModal } from '../components/QueryModal/AggregateQueryModal';
import { StyledButton, StyledDefaultButton, StyledInput, StyledInputDark } from '../components/Styled/StyledComponents';


export const EditView = () => {

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const model = useAppSelector(modelSelector);
    const lPanelWidth = useAppSelector(leftPanelWidthSelector);
    const rPanelWidth = useAppSelector(rightPanelWidthSelector);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const edges = useAppSelector(edgesSelectors.selectAll);
    const constraints = useAppSelector(constraintsSelectors.selectAll);
    const [snackBarContent, setSnackBarContent] = useState<Parameters<RaiseMessageCallback> & { timestamp: number }>();

    // const {fileId} = useParams();
    const { state } = useLocation();

    const [multiplier, setMultiplier] = useState<number>(2);

    const [contextMenuTarget, setContextMenuTarget] = useState<{
        node: PatternNode | PatternEdge,
        selection?: Set<IVisualElement>,
        event: MouseEvent
    }>();


    const [fileCache, setFileCache] = useState<QueryForageItem>();

    const [elementPopup, setElementPopup] = useState<Parameters<NonNullable<PatternGraphEngine["_onEdgeSelectTypeCallback"]>>>();

    const [multiplierPopup, setMultiplierPopup] = useState<{ position: PopoverPosition, onMultiplierCommit: (multi: number) => void }>();


    /**
     * 和 画布 通信
     */
    const { engineRef, containerRef } = usePatternEngine(
        model,
        (...args) => {
            setSnackBarContent({ ...args, timestamp: new Date().getTime() });
            setSnackbarOpen(true);
            // console.log("!!!!!")
        },
        (node, event) => {
            setContextMenuTarget({ node, event });
        },
        (edge, event) => {
            setContextMenuTarget({ node: edge, event });
        },
        (selection, firedAt, event) => {
            setContextMenuTarget({ selection, node: firedAt as (PatternEdge | PatternNode), event });
        },
        (point, types, onSelect) => {
            setElementPopup([point, types, onSelect]);
        },
        [model]
    );

    useEffect(() => {
        fileCache && engineRef.current?.restoreFromFile(fileCache);
    }, [fileCache])

    useEffect(() => {
        if ((state as any)?.fileId) {

            dispatch(loadFileAsync((state as any).fileId, (f) => {
                setFileCache(f)
            }))

            if (!model) {
                fetchSchema().then(s => setModelBySchema(s))
            }

            return () => {
                dispatch(clearWorkspace())
            }

        }
        else {
            navigate('/');
        }

    }, [])

    const codeModal = useAppSelector(codeModalSelector);

    const globalConstraintPoolRef = useRef<IGlobalPanelContentRef>(null);
    const getConstraintContext = useCallback(() => {
        if (globalConstraintPoolRef.current) {
            return globalConstraintPoolRef.current.getConstraintContext()
        }
        return null;
    }, [globalConstraintPoolRef]);

    const isQueryModalOpen = useAppSelector(queryModalSelector);


    useEffect(() => {
        const onSave = () => {
            dispatch(saveFileWorkspace(getConstraintContext() ?? undefined))
        }
        // , 500)

        const delayedOnSave = _.debounce(() => {
            setTimeout(() => dispatch(saveFileWorkspace(getConstraintContext() ?? undefined)), 100)
        }, 400)

        window.addEventListener('unload', onSave);
        window.addEventListener('blur', onSave);
        window.addEventListener('click', delayedOnSave);

        return () => {
            window.removeEventListener('unload', onSave);
            window.removeEventListener('blur', onSave);
            window.removeEventListener('click', delayedOnSave);
        }
    }, [])

    return (<>

            <WorkspaceHeader />
            <div className='workspace-container'>
                {snackbarOpen && <Snackbar
                    anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                    open
                    autoHideDuration={3000}
                    onClose={_ => setSnackbarOpen(false)}
                    style={{ top: 48, left: lPanelWidth, zIndex: 1 }}>
                    <div className='global-message' style={{ width: `calc(100vw - ${lPanelWidth + rPanelWidth}px)` }}>
                        <Error20 fill="#EB5757" />
                        <div dangerouslySetInnerHTML={{ __html: snackBarContent?.[0] ?? "" }} />
                    </div>
                </Snackbar>}
                <div ref={containerRef} className="engine-root-container" />
                <ConceptPanel />
                <PropertyPanel engineRef={engineRef} />
                <GlobalPanelContent ref={globalConstraintPoolRef} initialContext={
                    fileCache ? getConstraintContextFromQueryForage(fileCache) : undefined
                } />
            </div>

            {contextMenuTarget?.node?.renderElements &&
                <Callout
                    target={contextMenuTarget?.event}
                    directionalHint={DirectionalHint.bottomLeftEdge}
                    onDismiss={ev => setContextMenuTarget(undefined)}
                    theme={ideographDarkTheme}
                    beakWidth={0}
                    calloutMaxWidth={320}
                    styles={{
                        calloutMain: {
                            borderRadius: 0,
                            padding: '8px 0'
                        }
                    }}>
                    {/* <div className='contextual-callout-item'
                        style={{ pointerEvents: 'none', fontWeight: 600, color: 'var(--grey700)' }}>
                        <div>连接</div>
                        <span className='contextual-callout-item-helper'></span>
                    </div>
                    <div className='contextual-callout-item'
                        onClick={ev => {
                            contextMenuTarget.node && engineRef.current?.setEditModeWithPayload(
                                EditMode.CreatingEdgeTo,
                                contextMenuTarget.node.uuid
                            )
                            setContextMenuTarget(undefined)
                        }}
                        style={{}}>
                        <div style={{ fontSize: 13 }}>连接到已有节点</div>
                        <span className='contextual-callout-item-helper'></span>
                    </div>

                    <div className='contextual-callout-item'
                        style={{}}>
                        <div style={{ fontSize: 13 }}>连接到新的节点</div>
                        <span className='contextual-callout-item-helper'></span>
                    </div>

                    <div className='contextual-callout-sep' /> */}
                    {
                        contextMenuTarget.selection && <>
                            <div className='contextual-callout-item' style={{ pointerEvents: 'none', fontWeight: 600, color: 'var(--grey700)' }}>
                                <div>组合</div>
                            </div>

                            <div className='contextual-callout-item' onClick={ev => {

                                setMultiplierPopup({
                                    position: { left: contextMenuTarget.event.x, top: contextMenuTarget.event.y },
                                    onMultiplierCommit: (multi) => {
                                        engineRef.current?.aggregateSelection(multi);
                                    }
                                })
                                setContextMenuTarget(undefined);
                            }}>
                                <div style={{ fontSize: 13, display: 'grid', }}>匹配多个实例</div>
                            </div>

                            <div className='contextual-callout-sep' />
                        </>
                    }

                    <div className='contextual-callout-item' style={{ pointerEvents: 'none', fontWeight: 600, color: 'var(--grey700)' }}>
                        <div>约束</div>
                    </div>

                    <div className='contextual-callout-item' >
                        <div style={{ fontSize: 13 }}>添加约束</div>
                    </div>

                    <div className='contextual-callout-item' >
                        <div style={{ fontSize: 13 }}>移除所有约束</div>
                    </div>

                    <div className='contextual-callout-sep' />

                    <div className='contextual-callout-item'
                        style={{}}
                        onClick={() => {
                            if (contextMenuTarget.node.elementType === VisualElementType.Node) {
                                engineRef.current?.deleteElement(
                                    contextMenuTarget.node.asObject()
                                )
                                edges.forEach(e => {
                                    if (e.from === contextMenuTarget.node.uuid || e.to == contextMenuTarget.node.uuid) {
                                        constraints.forEach(e => {
                                            if (e.targetId === e.id) {
                                                dispatch(deleteEdge(e.id))
                                            }
                                        })

                                        dispatch(deleteEdge(e.id))

                                    }
                                })

                                constraints.forEach(e => {
                                    if (e.targetId === contextMenuTarget.node.uuid) {
                                        dispatch(deleteConstraint(e.id))
                                    }
                                })
                                dispatch(deleteNode(contextMenuTarget.node.uuid))
                                setContextMenuTarget(undefined)
                            }
                            else {
                                engineRef.current?.deleteElement(
                                    contextMenuTarget.node.asObject()
                                )

                                constraints.forEach(e => {
                                    if (e.targetId === contextMenuTarget.node.uuid) {
                                        dispatch(deleteConstraint(e.id))
                                    }
                                })
                                dispatch(deleteEdge(contextMenuTarget.node.uuid))
                                setContextMenuTarget(undefined)
                            }
                        }}>
                        <div style={{ fontSize: 13 }}>移除节点</div>
                        <span className='contextual-callout-item-helper'></span>
                    </div>
                </Callout>
            }

            {
                elementPopup && <Callout
                    target={elementPopup[0]}
                    directionalHint={DirectionalHint.topCenter}
                    onDismiss={ev => setElementPopup(undefined)}
                    theme={ideographDarkTheme}
                    // beakWidth={0}
                    calloutMaxWidth={320}
                    styles={{
                        calloutMain: {
                            borderRadius: 0,
                            padding: '8px 0'
                        }
                    }}>
                    <div className='contextual-callout-item'
                        style={{ pointerEvents: 'none' }}>
                        <div style={{ fontSize: 13 }}>选择关系类型</div>
                        <span className='contextual-callout-item-helper'></span>
                    </div>

                    <div className='contextual-callout-sep' />
                    {elementPopup[1].map(relType => <div className='contextual-callout-item'
                        style={{}}
                        key={relType.id}
                        onClick={() => {
                            elementPopup[2](relType)
                            setElementPopup(undefined)
                        }}>
                        {pangu.spacing(relType.name)}
                    </div>)}
                </Callout>
            }


            {
                multiplierPopup && <Callout
                    target={multiplierPopup.position}
                    directionalHint={DirectionalHint.topCenter}
                    onDismiss={ev => {
                        setMultiplierPopup(undefined)
                    }}
                    theme={ideographDarkTheme}
                    calloutMaxWidth={320}
                    styles={{
                        calloutMain: {
                            borderRadius: 0,
                            padding: '8px 0'
                        }
                    }}>
                    <div className='contextual-callout-item'
                        style={{ pointerEvents: 'none' }}>
                        <div style={{ fontSize: 13 }}>输入匹配的子图数量</div>
                        <span className='contextual-callout-item-helper'></span>
                    </div>
                    <StyledInputDark onChange={ev => {
                        setMultiplier(Number(ev.target.value))
                    }} value={multiplier} style={{ height: 32, margin: '8px 16px 8px 16px', width: 'calc(100% - 32px)' }} />
                    <div style={{ padding: '8px 16px 8px 16px', width: '100%', columnGap: 16, display: 'grid', gridTemplateRows: '32px', gridTemplateColumns: '1fr 1fr' }}>
                        <StyledDefaultButton onClick={ev => {
                            setMultiplierPopup(undefined)
                        }} style={{ height: 32, background: "#414246", color: "#fff" }}>取消</StyledDefaultButton>
                        <StyledButton onClick={ev => {
                            console.log(multiplier)
                            multiplierPopup.onMultiplierCommit(multiplier)
                            setMultiplierPopup(undefined);
                        }} style={{ height: 32 }}>确认</StyledButton>
                    </div>

                </Callout>
            }


            {codeModal !== undefined
                && <>
                    <div style={{ left: 0, top: 0, width: '100vw', height: '100vh', backgroundColor: '#20222a60', fontSize: 14, position: 'absolute', zIndex: 99998, }}></div>
                    <div style={{ left: '10vw', top: '14vh', width: '80vw', height: '72vh', backgroundColor: '#1e1e1e', fontSize: 14, padding: 0, position: 'absolute', zIndex: 99999, boxShadow: 'rgba(0, 0, 0, 0.133) 0px 6.390625px 14px 0px, rgba(0, 0, 0, 0.11) 0px 1.1875px 3px 0px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '8px', }}>
                            <div style={{ display: 'flex', color: '#fff' }}>

                                <PanelTitle text={"JSON"} dimmed={codeModal !== "JSON"} topUnpadded />
                                <PanelTitle text={"Cypher"} dimmed={codeModal !== "Cypher"} topUnpadded />
                            </div>
                            <div style={{ display: 'flex' }}>
                                <ActionButtonTinyDark onClick={ev => dispatch(setCodeModal(undefined))}>
                                    <Close20 fill="#fff" />
                                </ActionButtonTinyDark>
                            </div>
                        </div>
                        <CodeEditor getConstraintContext={getConstraintContext} />
                    </div>
                </>}
            {isQueryModalOpen && <AggregateQueryModal
                getConstraintContext={getConstraintContext}
                getStructureContext={() => {
                    if (engineRef.current) { return engineRef.current.generatePatternGraphContext() }
                    else {
                        return {
                            nodes: {},
                            edges: {},
                            groups: {},
                        }
                    }
                }}
                onSaveHistory={history => {
                    if ((state as any)?.fileId)
                        patternHistoryForage.setItem((state as any).fileId, history)
                }} />}
        </>
    )
}