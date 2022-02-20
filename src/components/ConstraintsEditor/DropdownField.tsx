import { Checkmark20, ChevronDown20 } from '@carbon/icons-react'
import { BaseButton, Callout } from '@fluentui/react'
import { OptionUnstyled, PopperUnstyled, SelectUnstyled, SelectUnstyledProps } from '@mui/base'
import { Button, ButtonBase, ClickAwayListener, Popover, Popper, styled } from '@mui/material'
import React, { useRef, useState } from 'react'
import { CommonModel } from '../../utils/common/model'
import './GeneralInputField.css'

interface IClassDropdownProps<T extends CommonModel.IClass | CommonModel.IEdgeClass> {
    options: T[],
    // onRenderOption: (opt: T) => React.ReactNode,
    defaultOption?: T,
    onSelectOption: (opt: T) => void,
}


const DropdownButton = styled(ButtonBase)(theme => ({
    height: 32,
    width: '100%',
    border: '1px solid transparent',
    borderRadius: 4,
    '&:hover': {
        // backgroundColor: 'var(--grey50)',
        border: '1px solid var(--grey100)',
    },
    '&:active': {
        // backgroundColor: 'var(--grey100)',
        border: '1px solid var(--grey100)',
    },
}))

const DropdownListbox = styled('ul')(theme => ({
    width: '100%'

}))

const DropdownOption = styled('div')(theme => ({
    width: '100%',
    height: 32,
    // padding: '0 16px',
    color: '#fff',
    verticalAlign: 'center',
    // display: 'flex',
    // alignItems: 'center',
    '&:hover': {
        backgroundColor: 'var(--primary)',
    },
    cursor: 'default',
    '>div>svg>circle': {
        stroke: '#fff',
    },
    '>.edge-class-opt>div>div>svg>path': {
        stroke: '#fff',
    },

}))

const DropdownContent = styled('div')(theme => ({
    width: '100%',
    height: '100%',
    display: 'grid',
    alignItems: 'center',
    fontSize: 14,
    gridTemplateColumns: '24px 1fr 20px',
    padding: '0 4px',
    textAlign: 'left',
    columnGap: 4,
    '>svg>path': {
        transition: 'transform 0.2s',
    },
}))



const StyledSelect = React.forwardRef(function StyledSelect<TValue>(
    props: SelectUnstyledProps<TValue>,// & { rootStyle?: React.CSSProperties },
    ref: React.ForwardedRef<HTMLUListElement>,
) {
    const components: SelectUnstyledProps<TValue>['components'] = {
        Root: DropdownButton,
        Listbox: DropdownListbox,
        Popper: DropdownOption,
        ...props.components,
    };
    return <SelectUnstyled {...props} ref={ref} components={components} />;
}) as <TValue>(props: SelectUnstyledProps<TValue> & React.RefAttributes<HTMLUListElement>) => JSX.Element;



const ClassDropdownContent = (props: { coloredClass: CommonModel.IColoredClass, droppable?: boolean, selected?: boolean, className?: string }) => {
    return <DropdownContent className={props.className}>
        <svg width={24} height={24}>
            <circle cx={12} cy={12} r={8} fill={props.coloredClass.colorSlot.primary} />
        </svg>
        <div className="truncate">{props.coloredClass.name}</div>
        {props.droppable && <ChevronDown20 />}
        {props.selected && <Checkmark20 />}
    </DropdownContent>
}


const EdgeClassDropdownContent = (props: { edgeClass: CommonModel.IColoredEdgeClass, droppable?: boolean, selected?: boolean, className?: string }) => {
    return <div className={`edge-class-opt ${props.className}`}>
        <div className='edge-class-content'>
            <svg width={16} height={24}>
                <circle cx={12} cy={12} r={4} fill={props.edgeClass.from.colorSlot.primary} />
            </svg>
            <div className="truncate">
                {props.edgeClass.from.name}
            </div>
            <div className='arrow-container'>
                {props.edgeClass.specificType ?
                    <>
                        <svg width={24} height={24} className="arrow-svg">
                            <path d="M4 12L20 12" />
                        </svg>
                        {props.edgeClass.specificType}
                        <svg width={24} height={24} className="arrow-svg">
                            <path d="M4 12L20 12" />
                            <path d="M16 9L20 12L16 15" />
                        </svg>
                    </> :
                    <svg width={72} height={24} className="arrow-svg">
                        <path d="M4 12L68 12" />
                        <path d="M64 9L68 12L64 15" />
                    </svg>}
            </div>
            <svg width={16} height={24}>
                <circle cx={12} cy={12} r={4} fill={props.edgeClass.to.colorSlot.primary} />
            </svg>
            <div className="truncate">
                {props.edgeClass.to.name}
            </div>
        </div>
        {props.droppable && <ChevronDown20 />}
        {props.selected && <Checkmark20 />}
    </div>
}

export function ClassDropdownField(props: IClassDropdownProps<CommonModel.IColoredClass>) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [isOpen, setOpen] = useState(false);
    return <>
        <ClickAwayListener onClickAway={ev => { setOpen(false) }}>
            <DropdownButton ref={buttonRef}
                onClick={(ev) => {
                    setOpen(true)
                }}
                style={{
                    borderRadius: isOpen ? '4px 4px 0 0' : undefined,
                    borderColor: isOpen ? 'var(--grey100)' : undefined
                }}
            >
                {props.defaultOption && <ClassDropdownContent
                    coloredClass={props.defaultOption} droppable
                    className={isOpen ? "open-chevron" : "hide-chevron"}
                />}
            </DropdownButton>
        </ClickAwayListener>
        <Callout
            target={buttonRef.current}
            isBeakVisible={false}
            hidden={!isOpen}
            calloutWidth={buttonRef.current?.getBoundingClientRect().width}
            styles={{
                calloutMain: {
                    borderRadius: 0
                }
            }}>
            <div style={{ background: '#212224', padding: '8px 1px', borderRadius: 0, maxHeight: '90vh', overflow: 'auto' }}>
                {props.options.map(
                    c => <DropdownOption key={c.id} className={c.id === props.defaultOption?.id ? "general-input-option-selected" : ""}>
                        <ClassDropdownContent coloredClass={c} selected={c.id === props.defaultOption?.id} />
                    </DropdownOption>
                )}
            </div>
        </Callout>
    </>
}


export function EdgeDropdownField(props: IClassDropdownProps<CommonModel.IColoredEdgeClass>) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [isOpen, setOpen] = useState(false);
    return <>
        <ClickAwayListener onClickAway={ev => { setOpen(false) }}>
            <DropdownButton ref={buttonRef}
                onClick={(ev) => {
                    setOpen(true)
                }}
                style={{
                    borderRadius: isOpen ? '4px 4px 0 0' : undefined,
                    borderColor: isOpen ? 'var(--grey100)' : undefined
                }}
            >
                {props.defaultOption && <EdgeClassDropdownContent
                    edgeClass={props.defaultOption} droppable
                    className={isOpen ? "open-chevron" : "hide-chevron"}
                />}
            </DropdownButton>
        </ClickAwayListener>
        <Callout
            target={buttonRef.current}
            isBeakVisible={false}
            hidden={!isOpen}
            calloutWidth={buttonRef.current?.getBoundingClientRect().width}
            styles={{
                calloutMain: {
                    borderRadius: 0
                }
            }}>
            <div style={{ background: '#212224', padding: '8px 1px', borderRadius: 0, maxHeight: '90vh', overflow: 'auto' }}>
                {props.options.map(
                    c => <DropdownOption key={c.id} className={c.id === props.defaultOption?.id ? "general-input-option-selected" : ""}>
                        <EdgeClassDropdownContent edgeClass={c} selected={c.id === props.defaultOption?.id} />
                    </DropdownOption>
                )}
            </div>
        </Callout>
    </>
}