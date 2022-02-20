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
import { usePatternGraphEngine } from './engine/hook';
import { editModeSelector, modelSelector, setEditMode, workspaceSelector } from './store/slice/modelSlicer';
import { useIdeographShortcuts } from './utils/useIdeographShortcuts';
import { ConceptPanel } from './components/Panels/ConceptPanel/ConceptPanel';
import { PropertyPanel } from './components/Panels/PropertyPanel/PropertyPanel';
import { GlobalPanel } from './components/Panels/GlobalPanel/GlobalPanel';
import React from 'react';
import { PatternGraphEngine, RaiseMessageCallback, RaiseMessageType } from './engine/PatternGraphEngine';
import { usePatternEngine } from './utils/usePatternEngine';
import { CommonModel } from './utils/common/model';
import { Grow, Snackbar } from '@mui/material';
import { Alert } from './components/StyledMessage';
import { Error20, Help20 } from '@carbon/icons-react';

function App() {
    const dispatch = useAppDispatch();
    const model = useAppSelector(modelSelector);
    const editMode = useAppSelector(editModeSelector);
    const workspace = useAppSelector(workspaceSelector);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackBarContent, setSnackBarContent] = useState<Parameters<RaiseMessageCallback> & {timestamp: number}>();

    useIdeographShortcuts();
    const { containerRef, engineRef } = usePatternEngine(
        CommonModel.deserializeFromObject(model),
        (...args) => { setSnackBarContent({...args, timestamp: new Date().getTime()}); setSnackbarOpen(true); },
        [model]
    );


    return (
        <>
            <WorkspaceHeader />
            <div className='workspace-container'>
                <Snackbar
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    key={snackBarContent?.timestamp ?? 0}
                    open={snackbarOpen}
                    autoHideDuration={2000}
                    onClose={_ => setSnackbarOpen(false)}
                    style={{ top: 64 }}
                >
                    <div className='global-message'>
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
