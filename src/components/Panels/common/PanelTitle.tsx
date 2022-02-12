import { Pdf20 } from '@carbon/icons-react'
import React from 'react'
import { SpacedText } from '../../SpacedSpan'
import './PanelCommon.css'

interface IPanelTitleProps {
    text: string,
    children?: React.ReactNode,
    topBordered?: boolean,
}

export const _PanelTitle = (props: IPanelTitleProps) => {
    return <div className={props.topBordered?'panel-title-root panel-title-tb':'panel-title-root'}>
        <SpacedText>{props.text}</SpacedText>
        {props.children}
    </div>
}


export const PanelTitle = React.memo(_PanelTitle);
