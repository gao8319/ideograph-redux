import { Separator } from '@fluentui/react';
import React from 'react';
import { SpacedText } from '../SpacedSpan';

interface IContextualCalloutItem {
    text: string,
    onRenderHelper: () => JSX.Element,
    onClick: (ev: React.MouseEvent) => void,
}

interface IContextualCalloutProps {
    groups: IContextualCalloutItem[][]
}


export const ContextualCallout = (props: IContextualCalloutProps) => {
    return <div>
        {props.groups.map(
            (group, groupIndex) => {
                const renderedItems = group.map(
                    item => <div className='contextual-callout-item' onClick={item.onClick}>
                        <SpacedText>{item.text}</SpacedText>
                        {item.onRenderHelper()}
                    </div>
                )
                if (groupIndex === props.groups.length - 1)
                    return renderedItems;
                else return renderedItems.concat(
                    <Separator />
                )
            }
        )}
    </div>
}