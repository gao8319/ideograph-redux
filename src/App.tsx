import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import { useAppDispatch, useAppSelector } from './store/hooks'

import { nanoid } from '@reduxjs/toolkit';
import { addNode, nodesSelectors } from './store/slice/nodeSlicer';
import { ComparisonOperator } from './utils/common/operator';
import { addConstraint, constraintsSelectors } from './store/slice/constraintSlicer';
import { askGraphModel } from './utils/AskGraph';
import { convertAskGraphOntModel } from './utils/AskGraphConverter';
import { WorkspaceHeader } from './components/WorkspaceHeader/WorkspaceHeader';
import { codeModalSelector, editModeSelector, leftPanelWidthSelector, modelSelector, rightPanelWidthSelector, setCodeModal, setEditMode, workspaceSelector } from './store/slice/modelSlicer';
import { useIdeographShortcuts } from './utils/useIdeographShortcuts';
import { ConceptPanel } from './components/Panels/ConceptPanel/ConceptPanel';
import { PropertyPanel } from './components/Panels/PropertyPanel/PropertyPanel';
import { GlobalPanel } from './components/Panels/GlobalPanel/GlobalPanel';
import { PatternGraphEngine, RaiseMessageCallback, RaiseMessageType } from './engine/PatternGraphEngine';
import { usePatternEngine } from './utils/usePatternEngine';
import { Grow, Modal, Snackbar } from '@mui/material';
import { Alert } from './components/StyledMessage';
import { Close20, Close24, Error20, FitToScreen20, Help20, Maximize16, Maximize20, Scale20 } from '@carbon/icons-react';
import { edgesSelectors } from './store/slice/edgeSlicer';
import { ActionButtonTiny } from './components/Panels/common/ActionButton';
import { CodeEditor } from './components/CodeEditor/CodeEditor';
import { PanelTitle } from './components/Panels/common/PanelTitle';
import { GlobalPanelContent, IGlobalPanelContentRef } from './components/Panels/GlobalPanel/GlobalPanelContent';


const App = () => {

    useIdeographShortcuts();
    const dispatch = useAppDispatch();

    const model = useAppSelector(modelSelector);
    const lPanelWidth = useAppSelector(leftPanelWidthSelector);
    const rPanelWidth = useAppSelector(rightPanelWidthSelector);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackBarContent, setSnackBarContent] = useState<Parameters<RaiseMessageCallback> & { timestamp: number }>();

    const { containerRef } = usePatternEngine(
        model,
        (...args) => { setSnackBarContent({ ...args, timestamp: new Date().getTime() }); setSnackbarOpen(true); },
        [model]
    );

    const codeModal = useAppSelector(codeModalSelector);

    const globalConstraintPoolRef = useRef<IGlobalPanelContentRef>(null);

    const getConstraintContext = useCallback(() => {
        if (globalConstraintPoolRef.current) {
            return globalConstraintPoolRef.current.getConstraintContext()
        }
        return null;
    }, [globalConstraintPoolRef])

    return (
        <>
            <WorkspaceHeader />
            <div className='workspace-container'>
                <Snackbar
                    anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                    // key={snackBarContent?.timestamp ?? 0}
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
            {codeModal !== undefined
                && <>
                    <div style={{ left: 0, top: 0, width: '100vw', height: '100vh', backgroundColor: '#20222a60', fontSize: 14, position: 'absolute', zIndex: 99998, }}></div>
                    <div style={{ left: '10vw', top: '14vh', width: '80vw', height: '72vh', backgroundColor: '#fff', fontSize: 14, padding: 0, position: 'absolute', zIndex: 99999, boxShadow: 'rgba(0, 0, 0, 0.133) 0px 6.390625px 14px 0px, rgba(0, 0, 0, 0.11) 0px 1.1875px 3px 0px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '8px', }}>
                            <div style={{ display: 'flex' }}>
                                <PanelTitle text={"AskGraph API"} dimmed={codeModal !== "AskGraph API"} topUnpadded />
                                <PanelTitle text={"Cypher"} dimmed={codeModal !== "Cypher"} topUnpadded />
                                <PanelTitle text={"GraphQL"} dimmed={codeModal !== "GraphQL"} topUnpadded />
                                <PanelTitle text={"JSON"} dimmed={codeModal !== "JSON"} topUnpadded />
                            </div>
                            <div style={{ display: 'flex' }}>
                                <ActionButtonTiny onClick={ev => dispatch(setCodeModal(undefined))}>
                                    <FitToScreen20 />
                                </ActionButtonTiny>
                                <ActionButtonTiny onClick={ev => dispatch(setCodeModal(undefined))}>
                                    <Close20 />
                                </ActionButtonTiny>
                            </div>
                        </div>
                        <CodeEditor getConstraintContext={getConstraintContext} />
                    </div>
                </>}
        </>
    )
}

export default App
