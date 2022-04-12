import { Add20, ChevronDown16, Close20 } from "@carbon/icons-react"
import { Dropdown, ISelectableOption, ISelectionOptions } from "@fluentui/react";
import { MenuItem, styled } from "@mui/material";
import { nanoid } from "@reduxjs/toolkit";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { createNewFileAsync, overviewSelectors } from "../../store/slice/overviewSlicer";
import { DataSourceForageItem } from "../../utils/global/Storage";
import { generalCalloutStyle, ideographDarkTheme } from "../../utils/ideographTheme";
import { ActionButtonTiny } from "../Panels/common/ActionButton"
import { PanelTitle } from "../Panels/common/PanelTitle"
import { StyledButton, StyledDefaultButton, StyledInput, StyledSelect } from "../Styled/StyledComponents"
import { useNavigate } from 'react-router-dom'
import { pangu } from "../../utils/common/pangu";
import _ from "lodash";

interface ICreateDialogProps {
    onDismiss: () => void;
    // onConfirm: () => void;
}

const StyledOption = styled("div")(t => ({
    height: 36,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    columnGap: 8,
    padding: '0 0px',
    fontFamily: 'var(--font)',
    fontSize: 13,
}))

const StyledTitle = styled("div")(t => ({
    height: '100%',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    columnGap: 8,
    padding: '0 8px',
    fontFamily: 'var(--font)',
    fontSize: 13,
}))

const DataSourceOption = (props?: ISelectableOption<DataSourceForageItem>) => {
    return <StyledOption>
        <span>{props?.text}</span>
        <span style={{ fontFamily: 'var(--mono-font)', color: '#888888e0' }}>{props?.data?.mongo.hostAddress}</span>
    </StyledOption>
}

const DataSourceTitle = (props?: ISelectableOption<DataSourceForageItem>) => {
    return <StyledTitle>
        <span>{props?.text}</span>
        <span style={{ fontFamily: 'var(--mono-font)', color: '#888888e0' }}>{props?.data?.mongo.hostAddress}</span>
    </StyledTitle>
}



export const CreateDialog = (props: ICreateDialogProps) => {

    const overviews = useAppSelector(overviewSelectors);
    const [name, setName] = useState(pangu.spacing(`查询${_.sum(overviews.map(o=>o.queries.length))+1}`));
    const [dataSourceId, setDataSourceId] = useState<string>(overviews[0].dataSource.id);
    const inputRef = useRef<HTMLInputElement>(null);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();


    useEffect(() => {
        inputRef?.current?.select();
    }, [])


    return <>
        <div style={{ left: 0, top: 0, width: '100vw', height: '100vh', backgroundColor: '#20222a80', fontSize: 14, position: 'absolute', zIndex: 98, }}></div>
        <div style={{ left: 'calc(50vw - 300px)', top: '30vh', width: 600, height: 'auto', backgroundColor: '#fff', fontSize: 14, padding: 0, position: 'absolute', zIndex: 99, boxShadow: 'rgba(0, 0, 0, 0.133) 0px 6.390625px 14px 0px, rgba(0, 0, 0, 0.11) 0px 1.1875px 3px 0px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '8px', }}>
                <div style={{ display: 'flex' }}>
                    <PanelTitle text={"新建查询"} topUnpadded />
                </div>
                <div style={{ display: 'flex' }}>

                    <ActionButtonTiny onClick={props.onDismiss}>
                        <Close20 />
                    </ActionButtonTiny>
                </div>
            </div>
            <div style={{ display: 'grid', rowGap: 16, padding: 24, fontSize: 13, gridTemplateColumns: '120px 1fr auto', columnGap: 16, alignItems: 'center' }}>
                <span>查询名称<span style={{ color: 'red', paddingLeft: 2 }}>*</span></span>
                <StyledInput
                    onMouseUp={ev => (ev.target as HTMLInputElement).select()}
                    value={name} style={{ gridColumnEnd: 4, gridColumnStart: 2 }}
                    onChange={ev => setName(ev.target.value ?? pangu.spacing(`查询${_.sum(overviews.map(o=>o.queries.length))}`))}
                    inputRef={inputRef}
                />
                <span>将要连接的数据库<span style={{ color: 'red', paddingLeft: 2 }}>*</span></span>
                <Dropdown
                    calloutProps={generalCalloutStyle}
                    styles={{
                        title: {
                            height: 36,
                            border: '1px solid transparent',
                            background: 'var(--grey50)',
                            color: '#000!important',

                            borderRadius: 3,
                            padding: 0,
                        },
                        dropdown: {
                            height: 36,
                            padding: 0,
                            borderRadius: 3,
                        },

                        dropdownItem: {
                            height: 36,
                            padding: 0,
                            borderRadius: 3,
                        },
                        callout: {
                            borderRadius: 3,
                        },
                        caretDownWrapper: {
                            height: '100%',
                            display: 'inline-flex',
                            alignItems: 'center',
                            borderRadius: 3,
                        },
                        dropdownItemsWrapper: {
                            height: 36,
                            padding: 0,
                            borderRadius: 3,

                        }
                        ,
                        dropdownItems: {
                            height: 36,
                            padding: 0,
                            borderRadius: 3,
                        },
                        dropdownItemSelected: {
                            height: 36,
                            background: `var(--primary)!import`,
                            borderRadius: 3,
                        },

                    }}
                    onRenderCaretDown={props => <ChevronDown16 fill="#000" style={{
                        verticalAlign: 'center'
                    }} />}
                    options={overviews.map(o => ({
                        key: o.dataSource.id,
                        text: o.dataSource.name,
                        data: o.dataSource,
                    }))}
                    selectedKey={dataSourceId}
                    onChange={(ev, v) => v && setDataSourceId(v.key as string)}
                    onRenderOption={DataSourceOption}
                    theme={ideographDarkTheme}
                    onRenderTitle={(props) => {
                        if (!props) return <></>
                        return <DataSourceTitle {...props[0]} />
                    }}
                />

                <StyledDefaultButton disabled>
                    <Add20 />
                    连接到新数源
                </StyledDefaultButton>
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
                    navigate(`file?fileId=${fileId}` )
                }}>确定</StyledButton>
            </div>
        </div>
    </>
}