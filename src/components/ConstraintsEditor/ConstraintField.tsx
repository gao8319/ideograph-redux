import { Callout } from "@fluentui/react"
import { InputBase, Popover, Popper, styled, useAutocomplete } from "@mui/material"
import { nanoid } from "@reduxjs/toolkit"
import React, { useImperativeHandle } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Constraint, PrimitiveType, PrimitiveTypeName } from "../../engine/ontology/Constraints"
import { IOntologyClass, ISchemaProperty } from "../../engine/ontology/OntologyClass"
import { PatternGraphEngine } from "../../engine/PatternGraphEngine"
import { PatternNode } from "../../engine/visual/PatternNode"
import { VisualElementType } from "../../engine/visual/VisualElement"
import { IConstraint, IPatternNode } from "../../utils/common/graph"
import { CommonModel } from "../../utils/common/model"
import { ComparisonOperator } from "../../utils/common/operator"
import { ideographDarkTheme } from "../../utils/ideographTheme"
import './ConstraintInputField.css'




interface IConstraintFieldProps {
    class: CommonModel.IClass,
    node: IPatternNode,
    constraint?: IConstraint,
    onConstraintChange: (c: Partial<IConstraint>) => void,
}

const ConstraintBlockInput = styled(InputBase)(({ theme }) => ({
    fontSize: 14,
    fontFamily: 'var(--font)',
    height: '100%',
}))

const ConstraintBlockInputMono = styled(InputBase)(({ theme }) => ({
    fontSize: 14,
    fontFamily: 'var(--mono-font)',
    height: '100%',
    fontFeatureSettings: '"liga" 1',
}))

const operatorLiteral: Record<ComparisonOperator, string> = {
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


export interface IConstraintFieldRef {
    getConstraintUpdate: () => Partial<IConstraint>
}

export const ConstraintField = React.forwardRef<IConstraintFieldRef, IConstraintFieldProps>(
    (props, ref) => {
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

        useEffect(
            () => {
                if (prop) {
                    if (operator && !acceptableOperatorDict[prop.type].includes(operator))
                        setOperator(ComparisonOperator.Equal)
                }
            }, [prop]
        )

        useImperativeHandle(
            ref, () => ({
                getConstraintUpdate: () => {
                    return (prop && operator && value) ?
                        {
                            // expression: prop.name,
                            property: prop,
                            operator,
                            value,
                            id: props.constraint?.id ?? nanoid(),
                            targetType: VisualElementType.Node,
                            targetId: props.node.id,
                        } : {}
                }
            }), [prop, operator, value]
        )

        // const {
        //     getInputProps: getOperatorInputProps,
        //     getListboxProps: getOperatorListboxProps,
        //     getOptionProps: getOperatorOptionProps,
        //     groupedOptions: operatorOptions,
        // } = useAutocomplete({
        //     id: 'use-autocomplete-operator',
        //     options: prop ? acceptableOperatorDict[prop.type] : [],
        //     getOptionLabel: (option) => option,
        // });

        // TODO: validate


        useEffect(() => {
            // console.log(isValueInputFocused, isOperatorInputFocused, isPropNameInputFocused)
            if ((!isOperatorInputFocused) && (!isPropNameInputFocused) && (!isValueInputFocused)) {
                // console.log(prop, value, operator);
                if (prop && value && (operator !== undefined)) {
                    props.onConstraintChange(
                        {
                            operator,
                            value,
                            property: prop,
                            // expression: prop.name
                        }
                    )
                }
            }
        }, [isValueInputFocused, isOperatorInputFocused, isPropNameInputFocused])

        return <div style={{ position: 'relative', height: 32, }}>
            <div className={"constraint-input-root" +
                (isPropNameInputFocused || isValueInputFocused || isOperatorInputFocused ? " input-activated" : '')
                + (((propOptions.length > 0 && isPropNameInputFocused) || isOperatorInputFocused) ? " menu-revealed" : '')
            }
                ref={rootRef}
            >
                <ConstraintBlockInput
                    inputProps={getInputProps()}
                    placeholder="属性名"
                    onFocus={() => { setPropNameInputFocused(true) }}
                    onBlur={() => { setPropNameInputFocused(false) }} />
                <ConstraintBlockInputMono
                    value={operatorLiteral[operator ?? 0]}
                    style={{ fontWeight: 600 }}
                    onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setOperator(Number(ev.target.value) as ComparisonOperator)}
                    inputProps={{
                        ref: operatorInputRef,
                        onChange: (ev: React.ChangeEvent<HTMLInputElement>) => setOperator(Number(ev.target.value) as ComparisonOperator)
                    }}
                    placeholder="=="
                    onFocus={() => { setOperatorInputFocused(true); }}
                    onBlur={() => { setOperatorInputFocused(false); }} />
                <ConstraintBlockInputMono
                    placeholder="..."
                    value={value}
                    onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setValue(ev.target.value)}
                    style={{ textAlign: "right" }}
                    inputProps={{ ref: valueInputRef }}
                    onFocus={() => { setValueInputFocused(true); }}
                    onBlur={() => { setValueInputFocused(false); }} />
            </div>


            {rootRef.current
                // && isPropNameInputFocused
                && propOptions.length > 0
                && <Popper
                    open={isPropNameInputFocused}
                    anchorEl={rootRef.current}
                    style={{
                        width: (rootRef.current as HTMLDivElement).getBoundingClientRect().width,
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
                                <code style={{ color: 'rgb(0, 204, 175)'  }} className="shimmed">{option.type}</code></li>
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
        </div>
    }
)