import { Button, styled } from "@mui/material";


export const TextedSectionCommand = styled(Button)(theme => ({
    background: 'transparent',
    height: '100%',
    minWidth: 32,
    '&:hover': {
        background: '#f1f2f4'
    },
    color: '#20222a',
    borderRadius: 0,
    padding: '0 12px 0 16px',
    margin: 0,
}))


export const IconSectionCommand = styled(Button)(theme => ({
    background: 'transparent',
    height: '100%',
    minWidth: 32,
    '&:hover': {
        background: '#f1f2f4'
    },
    color: '#20222a',
    borderRadius: 0,
    padding: 0,
    margin: 0,
    aspectRatio: '1 / 1',
}))