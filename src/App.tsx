import { useEffect, useRef, useState } from 'react'
import './App.css'
import { useAppDispatch, useAppSelector } from './store/hooks'

import { nanoid } from '@reduxjs/toolkit';
import { addNode, nodesSelectors } from './store/slice/nodeSlicer';
import { ComparisonOperator } from './utils/common/operator';
import { addConstraint } from './store/slice/constraintSlicer';
import { askGraphModel } from './utils/AskGraph';
import { convertAskGraphOntModel } from './utils/AskGraphConverter';
import { WorkspaceHeader } from './components/WorkspaceHeader/WorkspaceHeader';
import { editModeSelector, leftPanelWidthSelector, modelSelector, rightPanelWidthSelector, setEditMode, workspaceSelector } from './store/slice/modelSlicer';
import { useIdeographShortcuts } from './utils/useIdeographShortcuts';
import { ConceptPanel } from './components/Panels/ConceptPanel/ConceptPanel';
import { PropertyPanel } from './components/Panels/PropertyPanel/PropertyPanel';
import { GlobalPanel } from './components/Panels/GlobalPanel/GlobalPanel';
import { PatternGraphEngine, RaiseMessageCallback, RaiseMessageType } from './engine/PatternGraphEngine';
import { usePatternEngine } from './utils/usePatternEngine';
import { Grow, Snackbar } from '@mui/material';
import { Alert } from './components/StyledMessage';
import { Error20, Help20 } from '@carbon/icons-react';
const App = () => {

    useIdeographShortcuts();

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
                <GlobalPanel />
            </div>
        </>
    )
}

export default App
