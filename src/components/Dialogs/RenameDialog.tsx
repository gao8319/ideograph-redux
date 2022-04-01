import { Add20, ChevronDown16, Close20 } from "@carbon/icons-react"
import { Dropdown, ISelectableOption, ISelectionOptions } from "@fluentui/react";
import { MenuItem, styled } from "@mui/material";
import { nanoid } from "@reduxjs/toolkit";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { createNewFileAsync, overviewSelectors } from "../../store/slice/overviewSlicer";
import { DataSourceForageItem, QueryForageItem } from "../../utils/global/Storage";
import { generalCalloutStyle, ideographDarkTheme } from "../../utils/ideographTheme";
import { ActionButtonTiny } from "../Panels/common/ActionButton"
import { PanelTitle } from "../Panels/common/PanelTitle"
import { StyledButton, StyledDefaultButton, StyledInput, StyledSelect } from "../Styled/StyledComponents"
import { useNavigate } from 'react-router-dom'
import { SpacedText } from "../SpacedSpan";
import { pangu } from "../../utils/common/pangu";
import _ from "lodash";

interface IRenameDialogProps {
    file: QueryForageItem
    // onRename: (newName: string) => void;
}


export const RenameDialog = (props: IRenameDialogProps) => {

    const overviews = useAppSelector(overviewSelectors);
    const [name, setName] = useState(pangu.spacing(`数据源${overviews.length + 1}`));
    const [dataSourceId, setDataSourceId] = useState<string>(overviews[0].dataSource.id);
    const inputRef = useRef<HTMLInputElement>(null);
    const dispatch = useAppDispatch();
    // const navigate = useNavigate();


    useEffect(() => {
        inputRef?.current?.select();
    }, [])


    return <>
        <div style={{ left: 0, top: 0, width: '100vw', height: '100vh', backgroundColor: '#20222a80', fontSize: 14, position: 'absolute', zIndex: 98, }}></div>
        <div style={{ left: 'calc(50vw - 300px)', top: '30vh', width: 600, height: 'auto', backgroundColor: '#fff', fontSize: 14, padding: 0, position: 'absolute', zIndex: 99, boxShadow: 'rgba(0, 0, 0, 0.133) 0px 6.390625px 14px 0px, rgba(0, 0, 0, 0.11) 0px 1.1875px 3px 0px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '8px', }}>
                <div style={{ display: 'flex' }}>
                    <PanelTitle text={pangu.spacing(`重命名“${props.file.name}”`)} topUnpadded />
                </div>
                <div style={{ display: 'flex' }}>
                    <ActionButtonTiny onClick={props.onDismiss}>
                        <Close20 />
                    </ActionButtonTiny>
                </div>
            </div>
            <div style={{ display: 'grid', rowGap: 16, padding: 24, fontSize: 13, gridTemplateColumns: '120px 1fr auto', columnGap: 16, alignItems: 'center' }}>
                <span>数据源名称<span style={{ color: 'red', paddingLeft: 2 }}>*</span></span>
                <StyledInput
                    onMouseUp={ev => (ev.target as HTMLInputElement).select()}
                    value={name} style={{ gridColumnEnd: 4, gridColumnStart: 2 }}
                    onChange={ev => setName(ev.target.value ?? "新数据源")}
                    inputRef={inputRef}
                />
                <span>MongoDB<span style={{ color: 'red', paddingLeft: 2 }}>*</span></span>
                <StyledInput
                    onMouseUp={ev => (ev.target as HTMLInputElement).select()}
                    style={{ gridColumnEnd: 4, gridColumnStart: 2 }}
                // onChange={ev => setName(ev.target.value ?? "新数据源")}
                // inputRef={inputRef}
                />
                <span>Dgraph</span>
                <StyledInput
                    onMouseUp={ev => (ev.target as HTMLInputElement).select()}
                    style={{ gridColumnEnd: 4, gridColumnStart: 2 }}
                // onChange={ev => setName(ev.target.value ?? "新数据源")}
                // inputRef={inputRef}
                />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', columnGap: 16, padding: '36px 24px 24px' }}>
                <StyledDefaultButton style={{ width: '100%' }} onClick={props.onDismiss}>取消</StyledDefaultButton>
                <StyledButton style={{ width: '100%' }} onClick={() => {
                    const fileId = nanoid();
                    dispatch(
                        createNewFileAsync(
                            fileId,
                            dataSourceId,
                            name,
                        )
                    )
                    props.onDismiss();
                }}>确定</StyledButton>
            </div>
        </div>
    </>
}