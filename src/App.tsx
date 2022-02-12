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
import { PatternGraphEngine } from './engine/PatternGraphEngine';
import { usePatternEngine } from './utils/usePatternEngine';
import { CommonModel } from './utils/common/model';

function App() {
    const dispatch = useAppDispatch();
    const model = useAppSelector(modelSelector);
    const editMode = useAppSelector(editModeSelector);
    const workspace = useAppSelector(workspaceSelector);

    useIdeographShortcuts();
    const { containerRef, engineRef } = usePatternEngine(
        CommonModel.deserializeFromObject(model),
        [model]
    );


    return (
        <>
            <WorkspaceHeader />
            <div className='workspace-container'>
                <div ref={containerRef} className="engine-root-container" />

                <ConceptPanel />
                <PropertyPanel />
                <GlobalPanel />
            </div>
        </>
    )
}

export default App
