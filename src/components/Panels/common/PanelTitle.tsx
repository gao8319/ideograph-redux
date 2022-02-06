import { SpacedText } from '../../SpacedSpan'
import './PanelCommon.css'

interface IPanelTitleProps {
    text: string,
    children?: React.ReactChildren
}

export const PanelTitle = (props: IPanelTitleProps) => {
    return <div className='panel-title-root'>
        <SpacedText>{props.text}</SpacedText>
        {props.children}
    </div>
}