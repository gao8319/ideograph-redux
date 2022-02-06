import { useRef, useState } from 'react'
import './App.css'
import { useAppDispatch, useAppSelector } from './store/hooks'

import { nanoid } from '@reduxjs/toolkit';
import { addNode, nodesSelectors } from './store/slice/nodeSlicer';
import { ConstrainableElement } from './utils/common/graph';
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

function App() {
    const dispatch = useAppDispatch();
    const model = useAppSelector(modelSelector);
    const editMode = useAppSelector(editModeSelector);
    const workspace = useAppSelector(workspaceSelector);

    useIdeographShortcuts();

    const nodes = useAppSelector(nodesSelectors.selectAll);

    const addNewNode = () => {
        dispatch(addNode({
            id: nanoid(),
            position: { x: 0, y: 0 },
            constraints: [],
        }))
    }

    // const addNewEdge = () => {
    //     dispatch(addEdge({
    //         id: nanoid(),
    //         from: '',
    //         to: '',
    //         constraints: [],
    //         direction: EdgeDirection.Specified,
    //     }))
    // }

    const addNewConstraint = (targetId: string) => {
        dispatch(addConstraint({
            id: nanoid(),
            targetId,
            targetType: ConstrainableElement.Node,
            operator: ComparisonOperator.Equal,
            expression: '',
            value: 30,
            position: { x: 0, y: 0 }
        }))
    }

    const divContainerRef = useRef<HTMLDivElement>(null);


    return (
        <>
            <WorkspaceHeader />
            <div className='workspace-container'>

                <div ref={divContainerRef} style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '100%' }} />


                <ConceptPanel />
                <PropertyPanel />
                <GlobalPanel />
            </div>
        </>
    )
}

export default App
