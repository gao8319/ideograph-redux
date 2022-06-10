import React from 'react'
import { pangu } from '../utils/common/pangu'

type SpacedTextProps = {
    children: string,

} & React.AllHTMLAttributes<HTMLSpanElement>

/**
 * 一个会自动在中英文之间加 thin space 的 span
        THIN SPACE
        Unicode: U+2009，UTF-8: E2 80 89
 * @param props 
 * @returns 
 */
export const SpacedText = (props: SpacedTextProps) => {
    const spacedChildren = pangu.spacing(props.children);
    return <span {...props}>{spacedChildren}</span>
}

