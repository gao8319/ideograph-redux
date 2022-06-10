import { Add16, MacCommand16, MacShift16 } from "@carbon/icons-react";
import { Button, ButtonProps, styled, Tooltip } from "@mui/material";
import { CommandBarButton, DirectionalHint, IButtonProps, IButtonStyles, ICommandBarProps, TooltipDelay, TooltipHost } from "@fluentui/react";
import { useState } from "react";
import { generalCalloutStyle, ideographAltTheme, ideographDarkTheme, ideographTheme } from "../../utils/ideographTheme";

type IWorkspaceCommandProps = {
    children: React.ReactNode,
    hint?: string,
    shortcut?: string,
    cmd?: boolean,
    activated: boolean,
    autoLength?: boolean,
    forcedHighlight?: boolean
} & Omit<IButtonProps, "styles">

const workspaceCommandButtonStyle = {
    root: {
        height: 48,
        aspectRatio: '1 / 1',
        padding: 0,
        margin: 0
    }
}

const autoLengthStyle = {
    root: {
        height: 32,
        padding: '0 16px',
        margin: '8px 0',
        borderRadius: 3
    },
    flexContainer: {
        flexDirection: 'row-reverse',

    },
    label: {
        padding: '0 0 0 8px',
        margin: 0
    }
}

const WorkspaceCommandButton = styled(Button)(theme => ({
    height: 48,
    aspectRatio: '1 / 1',
    padding: 0,
    margin: 0
}))

// export const WorkspaceCommand = (props: IWorkspaceCommandProps) => {
//     // const [activated, setActivated] = useState(false);
//     return (props.hint || props.shortcut)
//         ? <Tooltip
//             arrow
//             title={
//                 <span className="general-tooltip">{props.hint}<span className="keyboard-shortcut">{props.cmd && <><MacCommand16 /><Add16 /></>}{props.shortcut}</span></span>
//             }>
//             <WorkspaceCommandButton>
//                 {props.children}
//             </WorkspaceCommandButton>
//         </Tooltip>
//         : <WorkspaceCommandButton>
//             {props.children}
//         </WorkspaceCommandButton>
// }

// export 

/**
 * header 上的按钮
 * @param props 
 * @returns 
 */
export const WorkspaceCommand = (props: IWorkspaceCommandProps) => {
    // const [activated, setActivated] = useState(false);
    return (props.hint || props.shortcut)
        ? <TooltipHost content={<span className="general-tooltip">{props.hint}<span className="keyboard-shortcut">{props.cmd && <><MacCommand16 /><Add16 /></>}{props.shortcut}</span></span>}
            theme={ideographDarkTheme}
            directionalHint={DirectionalHint.topCenter}
            delay={TooltipDelay.long}
            calloutProps={generalCalloutStyle}
        >
            <CommandBarButton {...props} styles={props.autoLength ? autoLengthStyle : workspaceCommandButtonStyle} theme={props.activated || props.forcedHighlight ? ideographAltTheme : ideographDarkTheme}>
                {props.children}
            </CommandBarButton>
        </TooltipHost>
        : <CommandBarButton {...props} styles={props.autoLength ? autoLengthStyle : workspaceCommandButtonStyle} theme={props.activated || props.forcedHighlight ? ideographAltTheme : ideographDarkTheme}>
            {props.children}
        </CommandBarButton>
}