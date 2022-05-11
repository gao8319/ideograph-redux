import { OpeningViewHeader } from "../components/WorkspaceHeader/OpeningViewHeader"
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { leftPanelWidthSelector } from "../store/slice/modelSlicer";
import '../components/Panels/ConceptPanel/ConceptPanel.css'
import { Autocomplete, Button, ButtonBase, Input, MenuItem } from "@mui/material";
import styled from "@emotion/styled";
import { Add20, Add24, Add32, ChartHistogram16, ChevronDown16, Close20, Connect32, DataBase16, Document16, Document20, DocumentImport32, Plug32, Query32, Settings16, Settings20, Time16, Workspace32, WorkspaceImport32 } from "@carbon/icons-react";
import React, { useEffect, useRef, useState } from "react";
import { ControlLabel } from "../components/Panels/common/ControlLabel";
import { PanelTitle } from "../components/Panels/common/PanelTitle";
import { SpacedText } from "../components/SpacedSpan";
import { ActionButtonTiny, ActionButtonTinyDark } from "../components/Panels/common/ActionButton";
import { StyledButton, StyledDefaultButton, StyledInput, StyledSelect } from "../components/Styled/StyledComponents";
import { CreateDialog } from "../components/Dialogs/CreateDialog";
import { getAll, getFileOverviews, getHashMap, IdeographDatabase, initDatabase, patternHistoryForage, PatternHistoryForageItem, queryForage, QueryForageItem } from "../utils/global/Storage";
import { deleteFile, initOverviewAsync, loadFileAsync, overviewSelectors, setOverviews, tryImportFileAsync } from "../store/slice/overviewSlicer";
import { pangu } from "../utils/common/pangu";
import { useNavigate } from 'react-router-dom';
import { ConnectDialog } from "../components/Dialogs/ConnectDialog";
import { useTitle } from "react-use";
import { FileThumbnail } from "../components/Thumbnail/FileThumbnail";
import _ from "lodash";
import { Callout, DirectionalHint } from "@fluentui/react";
import { ideographDarkTheme } from "../utils/ideographTheme";
import { nanoid } from "@reduxjs/toolkit";
import { SolutionDiagramGridView } from "../components/PatternSolutionDiagram/PatternSolutionDiagram";



const OpenningTab = styled(Button)(t => ({
    fontSize: 13,
    width: '100%',
    height: 42,
    textAlign: 'left',
    color: 'var(--grey700)',
    borderRadius: 0,
    justifyContent: 'flex-start',
    padding: 16,
    // display: 'grid',
    // gridTemplateColumns: '16px 1fr',
    // columnGap: 8,
    // alignItems: 'center',
    // verticalAlign: 'middle',
    '&:hover': {
        backgroundColor: 'var(--grey50)',
        // color:'var(--grey50)',
    },

}))


const OpenningTabActive = styled(OpenningTab)(t => ({
    color: 'var(--primary)',
    background: '#1870fb20',
    '&:hover': {
        background: '#1870fb28',
    },
    '&:active': {
        background: '#1870fb28',
    },
}))

const tabs: any = [
    // {
    //     name: "项目和文件",
    //     key: "files",
    // },
    // {
    //     name: "查询历史",
    //     key: "history",
    // },
    // {
    //     name: "设置",
    //     key: "settings",
    // }
]


const CreateNewButton = styled(Button)(t => ({
    textTransform: 'none',
    color: '#000',
    background: '#fff',
    border: '1px solid var(--grey100)',
    borderRadius: 4,
    width: '100%',
    height: 120,
    display: 'grid',
    gridTemplateColumns: '48px 1fr',
    columnGap: 16,
    alignItems: 'center',
    justifyContent: 'left',
    padding: 16,
    textAlign: 'left',
    '&:hover': {
        background: 'var(--grey20)',
    },
    '&:active': {
        background: 'var(--grey20)',
    },
    overflow: 'hidden',
    transition: 'background 0.1s',
    '&.Mui-disabled': {
        border: '1px solid transparent',
        background: 'var(--grey20)',
        '&>*': {
            opacity: 0.6,
        }
    }
}))


const DocumentButton = styled(CreateNewButton)(t => ({
    display: 'grid',
    overflow: 'hidden',
    gridTemplateColumns: '1fr',
    gridTemplateRows: '1fr 24px 18px',
    // width: 280,
    height: 180,
    // padding: 0,
    alignItems: 'inherit'
}))

type DialogType = "create" | "import" | "connect"

const dateFormatter = Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
});

export function FileManagementView() {

    const lPanelWidth = useAppSelector(leftPanelWidthSelector);
    const [activeTab, setActiveTab] = useState(0);
    const [dialog, setDialog] = useState<DialogType>();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useTitle('Ideograph')

    useEffect(() => {
        dispatch(initOverviewAsync());
        getHashMap<PatternHistoryForageItem>(patternHistoryForage).then(
            items => setHistory(items)
        )
    }, [])

    const overviews = useAppSelector(overviewSelectors);

    const [contextMenuTarget, setContextMenuTarget] = useState<{ event: MouseEvent, file: QueryForageItem }>();

    const [history, setHistory] = useState<Record<string, PatternHistoryForageItem>>({});



    return <>
        <OpeningViewHeader />

        <div style={{ backgroundColor: '#fff', height: 'calc(100vh - 48px)', width: '100vw', position: 'relative', display: 'grid', gridTemplateColumns: `${lPanelWidth + 1}px 1fr` }}>
            {/* <div className="concept-panel-root panel opening-left-panel" style={{ width: lPanelWidth }}>
                <div style={{ height: '100%', padding: '16px 0', gridTemplateRows: 'auto 1fr auto', display: 'grid' }}>
                    {
                        tabs.map((tab, index) => {
                            if (activeTab === index) return <OpenningTabActive key={tab.key} onClick={_ => setActiveTab(index)}>
                                {tab.name}
                            </OpenningTabActive>
                            return <OpenningTab key={tab.key} onClick={_ => setActiveTab(index)}>
                                {tab.name}
                            </OpenningTab>
                        })
                    }
                </div>
            </div> */}
            {activeTab === 0 && <div className="opening-tab">

                <div style={{ fontWeight: 600, fontSize: 14, height: 60, alignItems: 'center', display: 'inline-flex', paddingLeft: 24, columnGap: 8, paddingTop: 12 }}>
                    <SpacedText>
                        新建
                    </SpacedText>
                </div>

                <input
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={
                        async ev => {
                            const files = (ev.target as HTMLInputElement).files
                            const file = files?.item(0)
                            if (file) {
                                const dt = new Date().getTime();

                                const parsed: QueryForageItem = JSON.parse(await file.text());
                                parsed.name = `${parsed.name} - 导入自“${file.name}”`;
                                parsed.id = nanoid();
                                parsed.createTime = dt;
                                parsed.lastEditTime = dt;

                                dispatch(
                                    tryImportFileAsync(parsed,
                                        () => navigate(`file?fileId=${parsed.id}`, { state: { fileId: parsed.id } }))
                                )

                            }
                        }
                    } />
                <div style={{ display: 'grid', columnGap: 16, rowGap: 16, padding: '8px 24px 24px 24px', gridTemplateColumns: 'repeat(auto-fit, 280px)' }}>
                    <CreateNewButton onClick={_ => setDialog("create")}>
                        <img src="/static/file.svg" width={48} height={48} />
                        <div>
                            <span className="truncate" style={{ display: 'block' }}>新建查询</span>
                            <span className="truncate" style={{ display: 'block', color: 'var(--grey200)', fontSize: 12, fontWeight: 400 }}>构建新的查询条件</span>
                        </div>
                    </CreateNewButton>
                    <CreateNewButton onClick={_ => {
                        fileInputRef?.current?.click();
                    }}>
                        <img src="/static/import.svg" width={48} height={48} />
                        <div>
                            <span className="truncate" style={{ display: 'block' }}>从文件导入</span>
                            <span className="truncate" style={{ display: 'block', color: 'var(--grey200)', fontSize: 12, fontWeight: 400 }}>从 JSON 文件导入查询条件</span>
                        </div>
                    </CreateNewButton>
                    {/* <CreateNewButton onClick={_ => setDialog("connect")}>
                        <img src="/static/database.svg" width={48} height={48} />
                        <div>
                            <span className="truncate" style={{ display: 'block' }}>连接数据源</span>
                            <span className="truncate" style={{ display: 'block', color: 'var(--grey200)', fontSize: 12, fontWeight: 400 }}>连接到 MongoDB 和 DGraph</span>
                        </div>
                    </CreateNewButton> */}
                </div>

                {contextMenuTarget &&
                    <Callout
                        target={contextMenuTarget.event}
                        directionalHint={DirectionalHint.bottomLeftEdge}
                        onDismiss={ev => setContextMenuTarget(undefined)}
                        theme={ideographDarkTheme}
                        beakWidth={0}
                        calloutMaxWidth={320}
                        styles={{
                            calloutMain: {
                                borderRadius: 0,
                                padding: '8px 0',
                                minWidth: 180,
                            }
                        }}>

                        <div className='contextual-callout-item'>
                            <div>查询匹配结果</div>
                        </div>

                        <div className='contextual-callout-sep' />

                        <div className='contextual-callout-item'
                            onClick={
                                async (ev) => {
                                    // await queryForage.setItem(contextMenuTarget.file.id, {
                                    //     ...contextMenuTarget.file,
                                    //     name: "new name",
                                    // });
                                    setContextMenuTarget(undefined);
                                }
                            }
                        >
                            <div>重命名</div>
                        </div>

                        <div className='contextual-callout-item' onClick={
                            ev => {
                                queryForage.removeItem(contextMenuTarget.file.id);
                                dispatch(deleteFile(contextMenuTarget.file))
                                setContextMenuTarget(undefined);
                            }
                        }>
                            <div>删除</div>
                        </div>

                    </Callout>
                }
                {
                    overviews.map(
                        overview => <React.Fragment key={overview.dataSource.id}>
                            <div style={{ fontWeight: 600, fontSize: 14, height: 72, alignItems: 'center', display: 'inline-flex', paddingLeft: 24, columnGap: 8, paddingTop: 24 }}>
                                <SpacedText>
                                    {overview.dataSource.name}
                                </SpacedText>
                                <SpacedText style={{ color: 'var(--grey200)', fontWeight: 600, fontFamily: 'var(--mono-font)' }}>
                                    {`${overview.dataSource.mongo.hostAddress}:${overview.dataSource.mongo.port}`}
                                </SpacedText>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, 280px)',
                                rowGap: 16,
                                width: '100%',
                                columnGap: 16,
                                padding: '8px 24px 24px',
                            }}>
                                {
                                    _.sortBy(overview.queries, it => -it.createTime).map(
                                        f => <DocumentButton
                                            key={f.id}
                                            onClick={_ => {
                                                navigate(`file?fileId=${f.id}`, { state: { fileId: f.id } })
                                            }}
                                            onContextMenu={ev => {
                                                setContextMenuTarget({ event: ev.nativeEvent, file: f });
                                                ev.preventDefault();
                                            }}
                                        >
                                            <div style={{ background: 'var(--grey50)', width: 'calc(100% + 32px)', height: 'calc(100% + 8px)', margin: '-16px -16px 0 -16px' }}>
                                                <FileThumbnail file={f} />
                                            </div>
                                            <SpacedText className="truncate">{f.name}</SpacedText>
                                            <span className="truncate" style={{ fontSize: 12, fontWeight: 400, color: 'var(--grey200)' }}>
                                                {pangu.spacing(`${f.lastEditTime === f.createTime ? "创建" : "修改"}于${dateFormatter.format(f.lastEditTime)}`)}
                                            </span>
                                        </DocumentButton>

                                    )
                                }
                            </div>
                        </React.Fragment>
                    )
                }

            </div>}


            {
                activeTab === 1 && <div className="opening-tab">
                    <div style={{ fontWeight: 600, fontSize: 14, height: 60, alignItems: 'center', display: 'flex', paddingLeft: 24, columnGap: 8, paddingTop: 24 }}>
                        <SpacedText>
                            查询历史
                        </SpacedText>
                    </div>
                    {
                        Object.keys(history).map(
                            hist => <>
                                <div style={{ fontWeight: 500, fontSize: 14, height: 72, alignItems: 'center', display: 'flex', paddingLeft: 24, columnGap: 42, paddingTop: 24 }}>
                                    <SpacedText>
                                        {overviews.flatMap(it => it.queries).find(it => it.id === hist)?.name ?? ""}
                                    </SpacedText>
                                    <SpacedText style={{ color: 'var(--grey200)', fontWeight: 500 }}>
                                        {`${dateFormatter.format(history[hist].queryTimestamp)}，${history[hist].solutions.length}个结果`}
                                    </SpacedText>
                                </div>
                            </>
                        )
                    }
                </div>
            }

            {
                activeTab === 2 && <div className="opening-tab">
                    <div>

                    </div>
                </div>
            }
        </div>


        {
            dialog === "create" && <CreateDialog onDismiss={() => setDialog(undefined)} />
        }
        {
            dialog === "connect" && <ConnectDialog onDismiss={() => setDialog(undefined)} />
        }
    </>
}