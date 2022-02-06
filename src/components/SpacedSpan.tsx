import React from 'react'
import { pangu } from '../utils/common/pangu'

type SpacedTextProps = {
    children: string,

} & React.AllHTMLAttributes<HTMLSpanElement>

export const SpacedText = (props: SpacedTextProps) => {
    const spacedChildren = pangu.spacing(props.children);
    return <span {...props}>{spacedChildren}</span>
}

