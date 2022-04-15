import { Button, InputBase, Select, styled } from "@mui/material";

export const StyledLightInput = styled(InputBase)(t => ({
    backgroundColor: '#fff',
    width: '100%',
    height: 36,
    padding: '4px 8px',
    fontSize: 14,
    border: '1px solid transparent',
    borderRadius: 3,
    '&.Mui-focused': {
        // border: '1px solid var(--primary)'
    },
    '&>input': {
        padding: '4px 0',
    },
}))

export const StyledInput = styled(InputBase)(t => ({
    backgroundColor: 'var(--grey50)',
    width: '100%',
    height: 36,
    padding: '4px 8px',
    fontSize: 13,
    border: '1px solid transparent',
    borderRadius: 3,
    '&.Mui-focused': {
        border: '1px solid var(--primary)'
    },
    '&>input': {
        padding: '4px 0 4px 0!important',
    },
}))

export const StyledSelect = styled(Select)(t =>({
    backgroundColor: 'var(--grey50)',
    width: '100%',
    height: 36,
    padding: '4px 8px',
    fontSize: 13,
    border: '1px solid transparent',
    borderRadius: 3,
    '&.Mui-focused': {
        border: '1px solid var(--primary)'
    },
    '&>input': {
        padding: '4px 0',
    },
}))



export const StyledButton = styled(Button)(
    theme => ({
        minHeight: 0,
        backgroundColor: 'var(--primary)',
        padding: '0 16px',
        minWidth: 0,
        borderRadius: 3,
        fontSize: 13,
        height: 36,
        color: '#fff',
        lineHeight: 1,
        '&:hover': {
            backgroundColor: 'var(--primary-darken)'
        },
    })
)


export const StyledDefaultButton = styled(Button)(
    theme => ({
        minHeight: 0,
        backgroundColor: 'var(--grey50)',
        padding: '0 16px',
        minWidth: 0,
        borderRadius: 3,
        fontSize: 13,
        height: 36,
        color: '#000',
        lineHeight: 1,
        
        '&:hover': {
            backgroundColor: 'var(--grey100)'
        },
    })
)

