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
import { Grow, Modal, Snackbar } from '@mui/material';
import { Alert } from '../components/StyledMessage';
import { Close20, Close24, Error20, FitToScreen20, Help20, Maximize16, Maximize20, Scale20 } from '@carbon/icons-react';
import { edgesSelectors } from '../store/slice/edgeSlicer';
import { ActionButtonTiny, ActionButtonTinyDark } from '../components/Panels/common/ActionButton';
import { CodeEditor } from '../components/CodeEditor/CodeEditor';
import { PanelTitle } from '../components/Panels/common/PanelTitle';
import { GlobalPanelContent, IGlobalPanelContentRef } from '../components/Panels/GlobalPanel/GlobalPanelContent';
import { useNavigate } from 'react-router-dom';
import { fetchSchema } from '../services/Schema';
import { QueryModal } from '../components/QueryModal/QueryModal';
import { useSearchParam, useTitle } from 'react-use';
import { loadFileAsync } from '../store/slice/overviewSlicer';
import { PatternNode } from '../engine/visual/PatternNode';
import { Callout, DirectionalHint, Tooltip } from '@fluentui/react';
import { ideographDarkTheme } from '../utils/ideographTheme';
import { EditMode } from '../engine/visual/EditMode';
import { QueryForageItem } from '../utils/global/Storage';

export const EditView = () => {

    // useIdeographShortcuts();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const model = useAppSelector(modelSelector);
    const lPanelWidth = useAppSelector(leftPanelWidthSelector);
    const rPanelWidth = useAppSelector(rightPanelWidthSelector);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackBarContent, setSnackBarContent] = useState<Parameters<RaiseMessageCallback> & { timestamp: number }>();

    const fileId = useSearchParam('fileId');



    useEffect(() => {
        const onSave = () => {
            dispatch(saveFileWorkspace())
        }

        const delayedOnSave = () => {
            setTimeout(() => dispatch(saveFileWorkspace()), 100)
        }

        window.addEventListener('unload', onSave);
        window.addEventListener('blur', onSave);
        window.addEventListener('click', delayedOnSave);

        return () => {
            window.removeEventListener('unload', onSave);
            window.removeEventListener('blur', onSave);
            window.removeEventListener('click', delayedOnSave);
        }
    }, [])



    const [contextMenuTarget, setContextMenuTarget] = useState<{ node: PatternNode, event: MouseEvent }>();

    const [fileCache, setFileCache] = useState<QueryForageItem>();

    const { engineRef, containerRef } = usePatternEngine(
        model,
        (...args) => {
            setSnackBarContent({ ...args, timestamp: new Date().getTime() }); setSnackbarOpen(true);
        },
        (node, event) => {
            setContextMenuTarget({ node, event });
        },
        [model]
    );

    useEffect(() => {
        fileCache && engineRef.current?.restoreFromFile(fileCache);
    }, [fileCache])

    useEffect(() => {

        if (fileId) {

            dispatch(loadFileAsync(fileId, (f) => {
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

    return (
        <>
            <WorkspaceHeader />
            <div className='workspace-container'>
                <Snackbar
                    anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                    open={snackbarOpen}
                    autoHideDuration={3000}
                    onClose={_ => setSnackbarOpen(false)}
                    style={{ top: 48, left: lPanelWidth, zIndex: 1 }}>
                    <div className='global-message' style={{ width: `calc(100vw - ${lPanelWidth + rPanelWidth}px)` }}>
                        <Error20 fill="#EB5757" />
                        <div dangerouslySetInnerHTML={{ __html: snackBarContent?.[0] ?? "" }} />
                    </div>
                </Snackbar>
                <div ref={containerRef} className="engine-root-container" />
                <ConceptPanel />
                <PropertyPanel />
                <GlobalPanelContent ref={globalConstraintPoolRef} />
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
                    <div className='contextual-callout-item'
                        style={{ pointerEvents: 'none', fontWeight: 600, color: 'var(--grey700)' }}>
                        <div>连接</div>
                        <span className='contextual-callout-item-helper'></span>
                    </div>
                    <div className='contextual-callout-item'
                        onClick={ev => {
                            engineRef.current?.setEditModeWithPayload(
                                EditMode.CreatingEdgeTo,
                                contextMenuTarget?.node.uuid
                            )
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

                    <div className='contextual-callout-sep' />

                    <div className='contextual-callout-item'
                        style={{ pointerEvents: 'none', fontWeight: 600, color: 'var(--grey700)' }}>
                        <div>属性约束</div>
                        <span className='contextual-callout-item-helper'></span>
                    </div>
                    <div className='contextual-callout-item'
                        style={{}}>
                        <div style={{ fontSize: 13 }}>清除所有约束</div>
                        <span className='contextual-callout-item-helper'></span>
                    </div>

                    <div className='contextual-callout-sep' />


                    <div className='contextual-callout-item'
                        style={{}}>
                        <div style={{ fontSize: 13 }}>移除节点</div>
                        <span className='contextual-callout-item-helper'></span>
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
            {isQueryModalOpen && <QueryModal getConstraintContext={getConstraintContext} />}
        </>
    )
}