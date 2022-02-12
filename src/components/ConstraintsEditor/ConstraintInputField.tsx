import { Callout } from "@fluentui/react"
import { InputBase, Popover, Popper, styled, useAutocomplete } from "@mui/material"
import React, { useImperativeHandle } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { BinaryOperator, Constraint, PrimitiveType, PrimitiveTypeName } from "../../engine/ontology/Constraints"
import { IOntologyClass, ISchemaProperty } from "../../engine/ontology/OntologyClass"
import { PatternGraphEngine } from "../../engine/PatternGraphEngine"
import { PatternNode } from "../../engine/visual/PatternNode"
import { ideographDarkTheme } from "../../utils/ideographTheme"
import './ConstraintInputField.css'




interface IConstraintInputFieldProps {
    engine: PatternGraphEngine,
    ontogyClass: IOntologyClass,
    containerProps?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
    onAddConstraint?: (constraint: Constraint) => void,
    constraintUuid?: string,
    parentNode: PatternNode,
    initialValue?: Constraint
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

const operatorDescription: Record<string, string> = {
    "==": "等于",
    ">=": "大于等于",
    "<=": "小于等于",
    ">": "大于",
    "<": "小于",
    "!=": "不等于",
    "~=": "匹配正则表达式",
}


const acceptableOperatorDict: Required<Record<PrimitiveTypeName, BinaryOperator[]>> = {
    "string":
        [BinaryOperator.Equals, BinaryOperator.NotEquals, BinaryOperator.Matches],
    "number":
        [BinaryOperator.Equals, BinaryOperator.Less, BinaryOperator.LessOrEquals, BinaryOperator.Greater, BinaryOperator.GreaterOrEquals, BinaryOperator.NotEquals],
    "boolean":
        [BinaryOperator.Equals, BinaryOperator.NotEquals],
}


// export const AutoCompleteConstraintField = (props: IConstraintInputFieldProps) => {
//     const rootRef = useRef<HTMLDivElement>(null);

//     const {
//         getRootProps,
//         getInputLabelProps,
//         getInputProps,
//         getListboxProps,
//         getOptionProps,
//         groupedOptions: propOptions,
//     } = useAutocomplete({
//         id: 'use-autocomplete-demo',
//         options: props.ontogyClass.schema,
//         getOptionLabel: (option) => option.name,
//     });

//     const propNameInputRef = useRef<HTMLInputElement>(null);

// }

export interface IConstraintInputFieldRef {
    getConstraint: () => Constraint | null
}

export const ConstraintInputField = React.forwardRef<IConstraintInputFieldRef, IConstraintInputFieldProps>(
    (props, ref) => {
        const rootRef = useRef<HTMLDivElement>(null);
        const propNameInputRef = useRef<HTMLInputElement>(null);
        const operatorInputRef = useRef<HTMLInputElement>(null);
        const valueInputRef = useRef<HTMLInputElement>(null);

        const [isPropNameInputFocused, setPropNameInputFocused] = useState(false);
        const [isOperatorInputFocused, setOperatorInputFocused] = useState(false);
        const [isValueInputFocused, setValueInputFocused] = useState(false);


        const [prop, setProp] = useState<ISchemaProperty | undefined>(props.ontogyClass.schema.find( it => it.name === props.initialValue?.keyPath));
        const [operator, setOperator] = useState<BinaryOperator | undefined>(props.initialValue?.operator);
        const [value, setValue] = useState<PrimitiveType<PrimitiveTypeName> | undefined>(props.initialValue?.value);


        const {
            getInputProps,
            getListboxProps,
            getOptionProps,
            groupedOptions: propOptions,
        } = useAutocomplete({
            id: 'use-autocomplete-prop',
            options: props.ontogyClass.schema,
            getOptionLabel: (option) => option.name,
        });

        useEffect(
            () => {
                if (prop) {
                    if (operator && !acceptableOperatorDict[prop.type].includes(operator))
                        setOperator(BinaryOperator.Equals)
                }
            }, [prop]
        )

        useImperativeHandle(
            ref, () => ({
                getConstraint: () => {
                    return (prop && operator && value) ?
                        {
                            keyPath: prop.name,
                            type: prop.type,
                            operator,
                            value,
                        } : null
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
                    props.onAddConstraint?.({
                        keyPath: prop.name,
                        type: prop.type,
                        operator,
                        value,
                    });
                }
            }
        }, [isValueInputFocused, isOperatorInputFocused, isPropNameInputFocused])

        return <div {...props.containerProps} style={{ position: 'relative', height: 32, }}>
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
                    value={operator}
                    style={{ fontWeight: 600 }}
                    onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setOperator(ev.target.value as BinaryOperator)}
                    inputProps={{ ref: operatorInputRef, onChange: (ev: React.ChangeEvent<HTMLInputElement>) => setOperator(ev.target.value as BinaryOperator) }}
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
                        {(propOptions as ISchemaProperty[]).map((option, index) => {
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
                                <code style={{ opacity: 0.25 }} className="shimmed">{option.type}</code></li>
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
                                style={{
                                    fontFamily: 'var(--mono-font)',
                                    display: 'grid',
                                    fontFeatureSettings: '"liga" 1',
                                    gridTemplateColumns: '1fr 24px 1fr',
                                    columnGap: 4,
                                }}
                                key={option}
                                className="constraint-intellisense-button"
                                onPointerDown={ev => {
                                    setOperator(option);
                                    ev.stopPropagation();
                                    ev.preventDefault();
                                    (valueInputRef.current as HTMLInputElement)?.focus()
                                }}>
                                <span style={{ opacity: 0.25 }} className="shimmed">{prop.name}</span>
                                <span style={{ fontWeight: 600 }}>{option}</span>
                                <span style={{ opacity: 0.25 }} className="shimmed">({operatorDescription[option]})</span>
                            </li>
                        })}
                    </ul>
                </Popper>}
        </div>
    }
)