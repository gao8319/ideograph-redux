import { InputBase, styled } from "@mui/material";

export const InputField = styled(InputBase)(theme => ({
    fontSize: 14,
    fontFamily: 'var(--mono-font)',
    height: 32,

    width: '100%',
    border: '1px solid transparent',
    borderRadius: 4,
    '&>input':{
        padding: 0,
        width: '100%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    '&:hover': {
        // backgroundColor: 'var(--grey50)',
        border: '1px solid var(--grey100)',
    },
    '&:active': {
        // backgroundColor: 'var(--grey100)',
        border: '1px solid var(--grey100)',
    },
    '&:focus': {
        // backgroundColor: 'var(--grey100)',
        border: '1px solid var(--grey100)',
    },
    padding: '0 8px',
}))


