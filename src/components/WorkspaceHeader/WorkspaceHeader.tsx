import { AddAlt20, ChevronDown16, Code20, Cursor_220, Cursor_224, MacCommand16, MacOption16, Network_320, Network_420, Search20 } from '@carbon/icons-react';
import { TextField, TooltipHost } from '@fluentui/react';
import { Tooltip } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { PatternGraphEngine } from '../../engine/PatternGraphEngine';
import { EditMode } from '../../engine/visual/EditMode';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { constraintsSelectors } from '../../store/slice/constraintSlicer';
import { edgesSelectors } from '../../store/slice/edgeSlicer';
import { applyQuery, editModeSelector, exportToJson, inspectGeneratedCode, lastModifiedTimeSelector, projectNameSelector, setEditMode, setWorkspaceName, workspaceNameSelector } from '../../store/slice/modelSlicer';
import { nodesSelectors } from '../../store/slice/nodeSlicer';
import { dateFormatterPrecised } from '../../utils/common/date';
import { ContextualCallout } from '../ContextualCallout/ContextualCallout';
import { SpacedText } from '../SpacedSpan';
import { AddNode20 } from './AddNodeCommand';
import { ConnectCommand20 } from './ConnectCommand';
import { TextableCommand } from './TextableCommand';
import { WorkspaceCommand } from './WorkspaceCommand';
import './WorkspaceHeader.css'

// interface IWorkspaceProfile {
//     name: string,
//     projectName: string,
// }

export interface IWorkspaceHeaderProps {
    // profile: IWorkspaceProfile,
    // engine?: PatternGraphEngine,
    // editMode?: EditMode,
    // setEditMode?: (em: EditMode) => void,
}

const statisticPillStyle: React.CSSProperties = { backgroundColor: 'var(--primary)', padding: '2px 4px', borderRadius: 2, color: '#000' }

export const WorkspaceHeader = (props: IWorkspaceHeaderProps) => {
    // const [workspaceName, setWorkspaceHeader] = useState<string>(props.profile.name);
    const editMode = useAppSelector(editModeSelector);
    const projectName = useAppSelector(projectNameSelector);
    const workspaceName = useAppSelector(workspaceNameSelector);
    const lastModifiedTime = useAppSelector(lastModifiedTimeSelector);

    const nodeSize = useAppSelector(nodesSelectors.selectTotal);
    const edgeSize = useAppSelector(edgesSelectors.selectTotal);
    const constraintSize = useAppSelector(constraintsSelectors.selectTotal);


    const dispatch = useAppDispatch();


    // const { engine } = props;

    return <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        height: 48,
        width: '100%',
        background: '#20222a',
        color: '#fff',
        fontSize: 14,
        userSelect: 'none',
    }}>
        <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
            <WorkspaceCommand
                activated={editMode === EditMode.Default}
                onClick={_ => dispatch(setEditMode(EditMode.Default))}
                hint='选择和移动'
                shortcut='V'>
                <Cursor_220 fill={'#fff'} />

            </WorkspaceCommand>

            <WorkspaceCommand
                activated={editMode === EditMode.CreatingNode}
                onClick={_ => dispatch(setEditMode(EditMode.CreatingNode))}
                hint='添加概念'
                shortcut='N'>
                <AddNode20 fill={'#fff'} />
            </WorkspaceCommand>

            <WorkspaceCommand activated={editMode === EditMode.CreatingEdgeTo || editMode === EditMode.CreatingEdgeFrom}
                onClick={_ => dispatch(setEditMode(EditMode.CreatingEdgeFrom))}
                hint='添加关系约束'
                shortcut='E'>
                <ConnectCommand20 fill={'#fff'} />
            </WorkspaceCommand>
        </div>
        <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center' }}>
            <TextableCommand projectName={projectName} value={workspaceName} onChange={(ev) => { ev.target.value && dispatch(setWorkspaceName(ev.target.value)) }} onRenderCallout={
                () => {
                    return <>
                        <ContextualCallout groups={[[{
                            onRenderContent: () => <span style={{ color: 'var(--grey700)' }}>最后修改时间  {dateFormatterPrecised.format(lastModifiedTime)}</span>,
                            text: 'time',
                        },
                        {
                            onRenderContent: () => <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%',  columnGap:24 }}>
                                <SpacedText style={statisticPillStyle}>{nodeSize + '个点'}</SpacedText>
                                <SpacedText style={statisticPillStyle}>{edgeSize + '条边'}</SpacedText>
                                <SpacedText style={statisticPillStyle}>{constraintSize + '个约束'}</SpacedText>
                            </div>,
                            text: 'meta',
                        }],
                        [
                            { text: "导出为JSON文件", onRenderHelper: () => <><span></span><MacCommand16 />{"E"}</>, onClick: () => { dispatch(exportToJson()) } }
                        ], [
                            { text: "生成Cypher语句", onRenderHelper: () => <><MacCommand16 /><MacOption16 />{"C"}</>, onClick: () => { dispatch(inspectGeneratedCode("Cypher")) } },
                            { text: "生成GraphQL语句", onRenderHelper: () => <><MacCommand16 /><MacOption16 />{"G"}</>, onClick: () => { dispatch(inspectGeneratedCode("GraphQL")) } },
                            { text: "生成SQL语句", onRenderHelper: () => <><MacCommand16 /><MacOption16 />{"S"}</>, onClick: () => { dispatch(inspectGeneratedCode("SQL")) } }
                        ],
                        ]} />
                    </>
                }
            } />
        </div>
        <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8 }}>
            <WorkspaceCommand activated={false}
                hint='匹配查询'
                shortcut=' Enter'
                cmd
                autoLength
                forcedHighlight
                text='查询'
                style={{ color: '#fff' }}
                onClick={_ => dispatch(applyQuery())}>
                <Search20 fill="#fff" />
            </WorkspaceCommand>
        </div>
    </div>
}