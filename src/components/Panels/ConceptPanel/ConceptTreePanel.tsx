import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { classTreeSelector, editPayloadSelector, modelSelector, setEditModeWithPayload } from '../../../store/slice/modelSlicer';
import { PanelTitle } from '../common/PanelTitle';

import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList as List } from 'react-window';
import { CommonModel } from '../../../utils/common/model';
import _ from 'lodash';
import { useUpdateEffect } from 'react-use';
import './ConceptPanel.css'
import { ChevronDown16, ChevronRight16 } from '@carbon/icons-react';
import { EditMode } from '../../../engine/visual/EditMode';

type TreeLikeClass = CommonModel.IClass & {
    children?: TreeLikeClass[],
    collapsed?: boolean,
    indentLevel?: number
}

const _flattenTreeClasses = (c: TreeLikeClass, indentLevel = 0): TreeLikeClass[] => {
    const childrenArray = (c.children ?? []).flatMap(it => _flattenTreeClasses(it, indentLevel + 1))
    const parentArray = [Object.assign(c, { indentLevel })] as TreeLikeClass[]
    if (c.collapsed) {
        return parentArray
    }
    else return parentArray.concat(childrenArray)
}

const flattenTreeClasses = (c: TreeLikeClass[]): TreeLikeClass[] => {
    const res = c.flatMap(it => _flattenTreeClasses(it));
    return res;
}

export const ConceptTreePanel = (

) => {
    const conceptTree = useAppSelector(classTreeSelector);
    const model = useAppSelector(modelSelector);
    const dispatch = useAppDispatch();
    const selectedPayload = useAppSelector(editPayloadSelector);

    const [conceptTreeClone, setConceptTreeClone] = useState<TreeLikeClass[] | undefined>(_.cloneDeep(conceptTree));


    const [flattenedConceptTreeRef, setFlattenedConceptTreeRef] = useState<TreeLikeClass[]>(flattenTreeClasses(conceptTreeClone ?? []));

    useUpdateEffect(() => {
        if (conceptTree) {
            const cloned = _.cloneDeep(conceptTree);
            setConceptTreeClone(cloned);
            cloned && setFlattenedConceptTreeRef(flattenTreeClasses(cloned));
        }
    }, [conceptTree]);


    return <div style={{ display: 'grid', gridTemplateRows: '44px 1fr', height: 'calc(100% - 44px)' }}>
        <PanelTitle text="添加概念" />
        <AutoSizer style={{ width: '100%', height: '100%' }}>
            {
                size => <List itemKey={(i, d) => flattenedConceptTreeRef[i].id} itemCount={flattenedConceptTreeRef.length} itemSize={40} width={size.width} height={size.height}>
                    {
                        (prop) => {
                            const itemRef = flattenedConceptTreeRef[prop.index]
                            const trueItem = model?.classes.find(it => it.id === itemRef.id);
                            return <div style={prop.style} key={itemRef.id}>
                                {
                                    trueItem && <div className='concept-tree-node'

                                        onClick={
                                            () => {
                                                dispatch(setEditModeWithPayload(
                                                    { editMode: EditMode.CreatingNode, payload: trueItem.id }
                                                ))
                                            }
                                        }>
                                        <svg width={(itemRef.indentLevel ?? 0) * 16} height={40} style={{ transform: 'translateY(-2px)' }}>
                                            {
                                                new Array(itemRef.indentLevel).fill(null).map(
                                                    (it, idx) => {
                                                        const offset = (itemRef.indentLevel ?? 0) * 16 - 6
                                                        return <line x1={offset} y1={0} x2={offset} y2={40} stroke="var(--grey100)" stroke-width="1px" />
                                                    }
                                                )
                                            }
                                        </svg>

                                        {
                                            <div style={{ margin: '0 -2px 0 2px', opacity: itemRef.children ? 1 : 0, width: 16, height: 40 }} className="concept-tree-node-chev"
                                                onClick={(ev) => {
                                                    if (itemRef.children) {
                                                        itemRef.collapsed = !itemRef.collapsed;
                                                        setFlattenedConceptTreeRef(flattenTreeClasses(conceptTreeClone ?? []));
                                                        ev.stopPropagation();
                                                    }
                                                }} >
                                                {itemRef.collapsed ? <ChevronRight16 /> : <ChevronDown16 />}
                                            </div>
                                        }
                                        <svg width={28} height={24} className="tree-node-circle">
                                            <circle className={selectedPayload === itemRef.id ? "active" : ""} cx={12} cy={12} fill={trueItem.colorSlot.primary} />
                                        </svg>
                                        {trueItem.name}
                                    </div>
                                }
                            </div>
                        }
                    }
                </List>
            }
        </AutoSizer>
    </div>
}