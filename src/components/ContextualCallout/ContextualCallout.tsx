import { Separator } from '@fluentui/react';
import React from 'react';
import { SpacedText } from '../SpacedSpan';
import './ContextualCallout.css'

interface IContextualCalloutItem {
    text: string,
    onRenderHelper?: () => JSX.Element,
    onClick?: (ev: React.MouseEvent) => void,
    onRenderContent?: () => JSX.Element,
}

interface IContextualCalloutProps {
    groups: (IContextualCalloutItem[])[]
}


export const ContextualCallout = (props: IContextualCalloutProps) => {
    return <div className='contextual-callout-root'>
        {props.groups.map(
            (group, groupIndex) => {
                const renderedItems = group.map(

                    item => {
                        return item.onRenderContent ? <div className='contextual-callout-free' key={item.text}>{item.onRenderContent()}</div>
                            : <div className='contextual-callout-item'
                                onClick={item.onClick}
                                key={item.text}
                                style={{ pointerEvents: item.onClick ? undefined : 'none' }}>
                                <SpacedText>{(item).text}</SpacedText>
                                <span className='contextual-callout-item-helper'>{(item).onRenderHelper?.()}</span>
                            </div>
                    }
                )
                if (groupIndex === props.groups.length - 1)
                    return renderedItems;
                else return renderedItems.concat(
                    <div className='contextual-callout-sep' key={groupIndex}/>
                )
            }
        )}
    </div>
}