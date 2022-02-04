import { useState } from 'react'
import logo from './logo.svg'
import './App.css'
import { useAppDispatch, useAppSelector } from './store/hooks'

import { nanoid } from '@reduxjs/toolkit';
import { addNode, nodesSelectors } from './store/slice/nodeSlicer';
import { ConstrainableElement } from './store/common/graph';
import { ComparisonOperator } from './store/common/operator';
import { addConstraint } from './store/slice/constraintSlicer';
import { askGraphModel } from './utils/AskGraph';
import { convertAskGraphOntModel } from './utils/AskGraphConverter';

convertAskGraphOntModel(askGraphModel);

function App() {

    const dispatch = useAppDispatch();
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

    return (
        <div>
            <button onClick={addNewNode}>
                addNewNode
            </button>

            {/* <button onClick={addNewEdge}>
                addNewEdge
            </button> */}

            {nodes.length > 0 && <button onClick={_ => addNewConstraint(nodes[0].id)}>
                addNewConstraint
            </button>}
        </div>
    )
}

export default App
