import { ButtonUnstyled } from "@mui/base";
import { Button, ButtonBase, styled } from "@mui/material";

export const ActionButton = styled(ButtonBase)(theme => ({
    minWidth: 0,
    height: '100%',
    aspectRatio: '1 / 1',
    width: 'auto',
    '&:hover': {
        backgroundColor: 'var(--grey50)'
    },
    '&:active': {
        backgroundColor: 'var(--grey100)'
    },
}))

export const ActionButtonTiny = styled(ButtonBase)(theme => ({
    minWidth: 0,
    aspectRatio: '1 / 1',
    width: 32,
    height: 32, 
    '&:hover': {
        backgroundColor: 'var(--grey50)'
    },
    '&:active': {
        backgroundColor: 'var(--grey100)'
    },
    borderRadius: 3,
}))