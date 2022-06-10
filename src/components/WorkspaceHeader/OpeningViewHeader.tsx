import { IdeographLogoType } from "./IdeographLogoType"
import { WorkspaceCommand } from "./WorkspaceCommand"
import './WorkspaceHeader.css'
import { Image, } from "@fluentui/react"
import { InputBase, styled } from "@mui/material"
import { Search16, Search24 } from "@carbon/icons-react"
import { useAppSelector } from "../../store/hooks"
import { leftPanelWidthSelector } from "../../store/slice/modelSlicer"

const HeaderSearchInput = styled(InputBase)(t => ({
    // backgroundColor: '#88888840',
    color: '#fff',
    fontSize: 13,
    margin: 8,
    marginLeft: 0,
    borderRadius: 2,
    padding: '8px 16px',
    width: 576,

    minHeight: 0,
    height: 'calc(100% - 16px)',
    transition: 'width 0.2s',
    display: 'flex',
    flexDirection: 'row-reverse',
    columnGap: 12,
    '&.Mui-focused': {
        backgroundColor: '#88888860',
        width: 872,
    },
    '&>input': {
        color: '#fff',
        padding: '0 0 0 0'
    },
    '&:hover': {
        backgroundColor: '#88888860',
    }
}))

/**
 * 起始页的 header
 * @returns 
 */
export const OpeningViewHeader = () => {
    const lPanelWidth = useAppSelector(leftPanelWidthSelector);

    return <div className='ideograph-header'
        style={{ gridTemplateColumns: `${lPanelWidth}px 26px 1fr` }}
    >
        <WorkspaceCommand activated={false} style={{ marginLeft: 4 }}>
            <Image src="/static/ideograph.png" width={24} height={24} />
        </WorkspaceCommand>
        <div style={{ height: '100%', width: 1, backgroundColor: '#00000080' }} />

        <HeaderSearchInput renderSuffix={_ => <Search16 fill="#888888" />} placeholder="搜索数据源、查询历史或查询结果..." />

    </div>
}