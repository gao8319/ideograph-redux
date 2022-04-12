import { Checkmark16, Checkmark20, Close16, Close20 } from "@carbon/icons-react"
import { Popper, useAutocomplete } from "@mui/material"
import { useRef, useState } from "react"
import { Constraint, PrimitiveType, PrimitiveTypeName } from "../engine/ontology/Constraints"
import { IOntologyClass } from "../engine/ontology/OntologyClass"
import { PatternGraphEngine } from "../engine/PatternGraphEngine"
import { PatternNode } from "../engine/visual/PatternNode"
import { IConstraint, IPatternNode } from "../utils/common/graph"
import { CommonModel } from "../utils/common/model"
import { ComparisonOperator } from "../utils/common/operator"
import { ActionButtonTiny } from "./Panels/common/ActionButton"
import { PanelTitle } from "./Panels/common/PanelTitle"
import { StyledButton, StyledDefaultButton, StyledInput } from "./Styled/StyledComponents"

interface IConstraintDialogProps {
    class: CommonModel.IClass,
    node: IPatternNode,
    constraint?: IConstraint,
    onConstraintChange: (c: Partial<IConstraint>) => void,
    onDismiss: () => void;
}



export const operatorLiteral: Record<ComparisonOperator, string> = {
    [ComparisonOperator.Equal]: "==",
    [ComparisonOperator.GreaterOrEqual]: ">=",
    [ComparisonOperator.LessOrEqual]: "<=",
    [ComparisonOperator.Greater]: ">",
    [ComparisonOperator.Less]: "<",
    [ComparisonOperator.NotEqual]: "!=",
    [ComparisonOperator.MatchRegex]: "~=",
}

const operatorDescription: Record<ComparisonOperator, string> = {
    [ComparisonOperator.Equal]: "等于",
    [ComparisonOperator.GreaterOrEqual]: "大于等于",
    [ComparisonOperator.LessOrEqual]: "小于等于",
    [ComparisonOperator.Greater]: "大于",
    [ComparisonOperator.Less]: "小于",
    [ComparisonOperator.NotEqual]: "不等于",
    [ComparisonOperator.MatchRegex]: "匹配正则表达式",
}



const acceptableOperatorDict: Required<Record<PrimitiveTypeName, ComparisonOperator[]>> = {
    "string":
        [ComparisonOperator.Equal, ComparisonOperator.NotEqual, ComparisonOperator.MatchRegex],
    "number":
        [ComparisonOperator.Equal, ComparisonOperator.Less, ComparisonOperator.LessOrEqual, ComparisonOperator.Greater, ComparisonOperator.GreaterOrEqual, ComparisonOperator.NotEqual],
    "boolean":
        [ComparisonOperator.Equal, ComparisonOperator.NotEqual],
}


export const ConstraintDialog = (props: IConstraintDialogProps) => {

    const rootRef = useRef<HTMLDivElement>(null);
    const propNameInputRef = useRef<HTMLInputElement>(null);
    const operatorInputRef = useRef<HTMLInputElement>(null);
    const valueInputRef = useRef<HTMLInputElement>(null);


    const [isPropNameInputFocused, setPropNameInputFocused] = useState(false);
    const [isOperatorInputFocused, setOperatorInputFocused] = useState(false);
    const [isValueInputFocused, setValueInputFocused] = useState(false);

    const [prop, setProp] = useState<CommonModel.IProperty | undefined>(
        props.constraint?.property// .class.properties.find(it => it.name === props.constraint?.expression)
    );
    const [operator, setOperator] = useState<ComparisonOperator | undefined>(props.constraint?.operator);
    const [value, setValue] = useState<PrimitiveType<PrimitiveTypeName> | undefined>(props.constraint?.value);


    const {
        getInputProps,
        getListboxProps,
        getOptionProps,
        groupedOptions: propOptions,
    } = useAutocomplete({
        id: 'use-autocomplete-prop',
        options: props.class.properties,
        getOptionLabel: p => p.name,
        defaultValue: prop,
    });

    return <>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', padding: '8px 8px 0 16px' }}>
            <div style={{ display: 'flex', fontWeight: 600 }}>
                添加属性约束
            </div>
            <div style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
                <ActionButtonTiny onClick={props.onDismiss}>
                    <Close20 />
                </ActionButtonTiny>
            </div>
        </div>
        <div style={{
            width: 360,
            display: 'grid',
            gridTemplateColumns: '2fr 48px 3fr',
            columnGap: 4,
            padding: 16,
        }} ref={rootRef}>
            <StyledInput style={{ fontFamily: 'var(--mono-font)' }}
                inputProps={getInputProps()}
                placeholder="属性名"
                onFocus={() => { setPropNameInputFocused(true) }}
                onBlur={() => { setPropNameInputFocused(false) }} 
                ref={propNameInputRef}/>
            <StyledInput placeholder={"="} style={{ fontFamily: 'var(--mono-font)' }} ref={operatorInputRef}/>
            <StyledInput placeholder={"0"} style={{ fontFamily: 'var(--mono-font)' }} ref={valueInputRef}/>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 16, padding: '8px 16px 16px 16px' }}>
            <StyledDefaultButton style={{ color: 'red' }}>
                取消
            </StyledDefaultButton>
            <StyledButton>
                添加
            </StyledButton>
        </div>

        {rootRef.current
            && propOptions.length > 0
            && <Popper
                open={isPropNameInputFocused}
                anchorEl={rootRef.current}
                style={{
                    width: (rootRef.current as HTMLDivElement).getBoundingClientRect().width,
                    zIndex: 9999
                }}
                className="hint-root"
            >
                <ul {...getListboxProps()} style={{ margin: 0, padding: 0, }}>
                    {(propOptions as CommonModel.IProperty[]).map((option, index) => {
                        const opProps = getOptionProps({ option, index })
                        return <li {...opProps}
                            style={{ fontFeatureSettings: '"liga" 1' }}
                            key={option.name}
                            className="constraint-intellisense-button"
                            onClick={(ev) => {
                                setProp(option);
                                (operatorInputRef.current as HTMLInputElement)?.focus();
                                opProps.onClick?.(ev);
                            }}>
                            <span>{option.name}</span>
                            <code style={{ color: 'rgb(0, 204, 175)' }} className="shimmed">{option.type}</code></li>
                    })}
                </ul>
            </Popper>}

        {rootRef.current
            && prop
            && <Popper
                open={isOperatorInputFocused}
                anchorEl={rootRef.current}
                style={{
                    width: (rootRef.current as HTMLDivElement)?.getBoundingClientRect().width,
                }}
                className="hint-root"
            >
                <ul style={{ margin: 0, padding: 0, }}>
                    {(acceptableOperatorDict[prop.type]).map((option, index) => {
                        return <li
                            key={option}
                            className="constraint-intellisense-button"
                            onPointerDown={ev => {
                                setOperator(option);
                                ev.stopPropagation();
                                ev.preventDefault();
                                (valueInputRef.current as HTMLInputElement)?.focus()
                            }}>
                            <span style={{ opacity: 0.25 }} className="shimmed">{prop.name}</span>
                            <span style={{ fontWeight: 600 }}>{operatorLiteral[option]}</span>
                            <span style={{ opacity: 0.25 }} className="shimmed">({operatorDescription[option]})</span>
                        </li>
                    })}
                </ul>
            </Popper>}
    </>
}