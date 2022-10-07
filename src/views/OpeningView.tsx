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
import {
    createNewFileAsync,
    deleteFile,
    initOverviewAsync,
    loadFileAsync,
    overviewSelectors,
    setOverviews,
    tryImportFileAsync
} from "../store/slice/overviewSlicer";
import { pangu } from "../utils/common/pangu";
import { useNavigate } from 'react-router-dom';
import { ConnectDialog } from "../components/Dialogs/ConnectDialog";
import { useTitle, useWindowSize } from "react-use";
import { FileThumbnail } from "../components/Thumbnail/FileThumbnail";
import _ from "lodash";
import { Callout, DirectionalHint } from "@fluentui/react";
import { ideographDarkTheme } from "../utils/ideographTheme";
import { nanoid } from "@reduxjs/toolkit";
import { SolutionDiagramGridView } from "../components/PatternSolutionDiagram/PatternSolutionDiagram";
import { ImportFileIcon, NewFileIcon } from "../components/Icons/NewFile";

const layout = {
    margin: 24,
    columnGap: 16
}

const calcBlockSize = (width: number) => {
    const approximateBlockCount = Math.floor(width / 290)  //math函数库中的一个函数,math.floor(x)返回小于参数x的最大整数,即对浮点数向下取整。x[]的取值
    const blockWidth = (width - ((approximateBlockCount - 1) * layout.columnGap) - (2 * layout.margin)) / approximateBlockCount

    return blockWidth
}

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

const tabs = [
    {
        name: "文件",
        key: "files",
    },
    {
        name: "历史查询结果",
        key: "history",
    },
    {
        name: "数据源",
        key: "database",
    },
    {
        name: "设置",
        key: "settings",
    }
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

type DialogType = "create" | "import" | "connect"| "rename"

const dateFormatter = Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
});

export function FileManagementView() {

    const lPanelWidth = useAppSelector(leftPanelWidthSelector);
    const [activeTab, setActiveTab] = useState(0);
    const [dialog, setDialog] = useState<DialogType>();            //通过 useState 可以创建一个 状态属性 和一个赋值方法
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();


    useTitle('Ideograph');

    useEffect(() => {                              //通过 useEffect 可以对副作用进行处理
        dispatch(initOverviewAsync());
        getHashMap<PatternHistoryForageItem>(patternHistoryForage).then(
            items => setHistory(items)
        )
    }, [])

    const overviews = useAppSelector(overviewSelectors);

    const [contextMenuTarget, setContextMenuTarget] = useState<{ event: MouseEvent, file: QueryForageItem }>();

    const inputRef = useRef<HTMLInputElement>(null);
    const [name, setName] = useState(pangu.spacing(`查询${_.sum(overviews.map(o => o.queries.length)) + 1}`));
    const [renameAvtive,setRenameActive]=useState<{ event: MouseEvent,file:QueryForageItem }>();

    const [history, setHistory] = useState<Record<string, PatternHistoryForageItem>>({});

    const windowSize = useWindowSize();


    return <>
        {/* <OpeningViewHeader /> */}

        <div style={{ backgroundColor: '#fff', height: '100vh', width: '100vw', position: 'relative', }}>

            {activeTab === 0 && <div className="opening-tab" style={{ height: '100vh' }}>

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
                    }
                />

                <div style={{ display: 'grid', columnGap: 16, rowGap: 16, padding: '8px 24px 24px 24px', gridTemplateColumns: `repeat(auto-fit, ${calcBlockSize(windowSize.width)}px)` }}>

                    <CreateNewButton onClick={_ => setDialog("create")}>
                        <NewFileIcon style={{ width: 48, height: 48 }} />
                        <div>
                            <span className="truncate" style={{ display: 'block' }}>新建查询</span>
                            <span className="truncate" style={{ display: 'block', color: 'var(--grey200)', fontSize: 12, fontWeight: 400 }}>构建新的查询条件</span>
                        </div>
                    </CreateNewButton>


                    <CreateNewButton onClick={_ => {
                        fileInputRef?.current?.click();
                    }}>
                        <ImportFileIcon style={{ width: 48, height: 48 }} />
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

                        {/*<div className='contextual-callout-item'*/}
                        {/*     onClick={()=> {*/}
                        {/*         setContextMenuTarget(undefined);*/}
                        {/*     }*/}
                        {/*     }*/}
                        {/*>*/}
                        {/*    <div>查询匹配结果</div>*/}
                        {/*</div>*/}

                        {/*<div className='contextual-callout-sep' />*/}

                        <div className='contextual-callout-item'
                            onClick={
                                async (ev) => {
                                    console.log(queryForage);
                                    setRenameActive({event: ev.nativeEvent,file:contextMenuTarget.file});
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
                    renameAvtive&&<div>
                        <div style={{ left: 0, top: 0, width: '100vw', height: '100vh', backgroundColor: '#20222a80', fontSize: 14, position: 'absolute', zIndex: 98, }}></div>
                        <div style={{ left: 'calc(50vw - 300px)', top: '30vh', width: 600, height: 'auto', backgroundColor: '#fff', fontSize: 14, padding: 0, position: 'absolute', zIndex: 99, boxShadow: 'rgba(0, 0, 0, 0.133) 0px 6.390625px 14px 0px, rgba(0, 0, 0, 0.11) 0px 1.1875px 3px 0px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '8px', }}>
                                <div style={{ display: 'flex' }}>
                                    <PanelTitle text={"重命名"} topUnpadded />
                                </div>
                                <div style={{ display: 'flex' }}>
                                    {/*<ActionButtonTiny onClick={props.onDismiss}>*/}
                                    {/*    <Close20 />*/}
                                    {/*</ActionButtonTiny>*/}
                                </div>
                            </div>
                            <div style={{ display: 'grid', rowGap: 16, padding: 24, fontSize: 13, gridTemplateColumns: '120px 1fr auto', columnGap: 16, alignItems: 'center' }}>
                                <span>新查询名<span style={{ color: 'red', paddingLeft: 2 }}>*</span></span>
                                <StyledInput
                                    onMouseUp={ev => (ev.target as HTMLInputElement).select()}
                                    value={name} style={{ gridColumnEnd: 4, gridColumnStart: 2 }}
                                    onChange={ev => setName(ev.target.value ?? pangu.spacing(`查询${_.sum(overviews.map(o => o.queries.length))}`))}
                                    inputRef={inputRef}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', columnGap: 16, padding: '36px 24px 24px' }}>
                                <StyledDefaultButton style={{ width: '100%' }} onClick={()=>{setRenameActive(undefined);}}>取消</StyledDefaultButton>
                                <StyledButton style={{ width: '100%' }} onClick={
                                    async () => {
                                        //console.log(queryForage);
                                        await queryForage.setItem(renameAvtive.file.id, {
                                            ...renameAvtive.file,
                                            name: name,
                                        });
                                        setRenameActive(undefined);
                                    }
                                }>确定</StyledButton>
                            </div>
                        </div>
                    </div>
                }


                <div style={{ height: "calc(100vh - 212px)", overflow: 'auto', borderTop: '1px solid var(--grey100)', }}>
                    <div style={{ fontWeight: 600, fontSize: 14, height: 72, alignItems: 'center', display: 'inline-flex', paddingLeft: 24, columnGap: 8, paddingTop: 8 }}>
                        <SpacedText>
                            历史查询
                        </SpacedText>
                    </div>

                    {
                        overviews.map(
                            overview => <React.Fragment key={overview.dataSource.id}>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(auto-fit, ${calcBlockSize(windowSize.width)}px)`,
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
                                                    //console.log(ev);//右键菜单
                                                    setContextMenuTarget({ event: ev.nativeEvent, file: f });
                                                    ev.preventDefault();  //不添加这一句的话，会弹出浏览器的右键菜单
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
                </div>
            </div>}



        </div>


        {
            dialog === "create" && <CreateDialog onDismiss={() => setDialog(undefined)} />
        }
        {
            dialog === "connect" && <ConnectDialog onDismiss={() => setDialog(undefined)} />
        }
        {/*{*/}
        {/*    dialog === "rename" && <RenameDialog onDismiss={() => setDialog(undefined)} />*/}
        {/*}*/}
    </>
}