import { Add16, ChevronDown16, MacCommand16 } from "@carbon/icons-react";
import { Button, ClickAwayListener, InputBase, InputBaseProps, styled } from "@mui/material";
import { IButton, Callout, CommandBarButton, DirectionalHint, IButtonProps, IButtonStyles, ICommandBarProps, TooltipDelay, TooltipHost } from "@fluentui/react";
import { useRef, useState } from "react";
import { generalCalloutStyle, ideographAltTheme, ideographDarkTheme, ideographTheme } from "../../utils/ideographTheme";
import { pangu } from "../../utils/common/pangu";
import { SpacedText } from "../SpacedSpan";


type ITextableCommandProps = {
    // children: React.ReactNode,
    // text?: string,
    onRenderCallout: () => JSX.Element,
    onChange: InputBaseProps['onChange'],
    value: string,
    projectName: string,
}// & Omit<IButtonProps, "styles" | "onClick">

const textableStyle: IButtonStyles = {
    root: {
        height: 48,
        padding: 0,
        margin: 0,//'0 8px 0 0'
        minWidth: 0,
    },
    flexContainer: {
        // flexDirection: 'row-reverse',
        // columnGap: '4px'
        padding: 0,
        minWidth: 0,
        width: 24
    },
    label: {
        padding: 0,
        margin: 0
    }
}

const StyledInput = styled(InputBase)(t => ({
    color: '#fff',
    minWidth: 0,
    textAlign: 'center',
    width: 200,
    flex: '1 1 auto',
    padding: 0,
    height: '48px',
    verticalAlign: 'bottom',
    display: 'inline-block',
    font: 'var(--font)',
    '&>input': {
        minWidth: 0,
        textAlign: 'center',
        height: '100%',
        padding: 0,
        fontSize: 14
    },
    // width: 'min-content!important',
}))

export const TextableCommand = (props: ITextableCommandProps) => {
    const [activated, setActivated] = useState(false);
    const [isCalloutOpen, setCalloutOpen] = useState(false);
    const buttonRef = useRef<HTMLElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    return <>
    
        {!activated && <>
            <SpacedText style={{ color: '#aaa', margin: '0 8px', padding: '0 8px' }}>{props.projectName}</SpacedText>
            <svg className="svg" width="9" height="18" viewBox="0 0 9 18" xmlns="http://www.w3.org/2000/svg"><path d="M1.032 16.825l6-16 .936.35-6 16-.936-.35z" fillRule="nonzero" fillOpacity="1" fill="#aaa" stroke="none"></path></svg>
        </>}

        {activated && <StyledInput
            value={props.value}
            onChange={props.onChange}
            onFocus={
                ev => ev.target.select()
            }
            onBlur={
                ev => setActivated(false)
            }
            onKeyDown={
                ev => {
                    if (ev.key === "Enter") {
                        setActivated(false)
                    }
                }
            }
            autoFocus
            ref={inputRef}
        />}

        {!activated && <>
            <div style={{ marginLeft: 16, marginRight: 4 }} onClick={_ => { setActivated(true); setCalloutOpen(false) }}>
                {pangu.spacing(props.value)}
            </div>

            <ClickAwayListener onClickAway={ev => setCalloutOpen(false)}>
                <CommandBarButton
                    elementRef={buttonRef}
                    onClick={_ => {
                        setCalloutOpen(true)
                    }}
                    styles={textableStyle}
                    theme={ideographDarkTheme}>
                    <ChevronDown16 />
                </CommandBarButton>
            </ClickAwayListener>

            {isCalloutOpen&&<Callout {...generalCalloutStyle}
                target={buttonRef.current}
                directionalHint={DirectionalHint.bottomCenter}
                onClick={()=>{setCalloutOpen(false)}}>
                {props.onRenderCallout()}
            </Callout>}
        </>}
    </>

}

// export const TextableCommand = styled(Button)(theme => ({
//     height: 48,
//     padding: '0 4px 0 8px',
//     margin: '0 8px'
// }))