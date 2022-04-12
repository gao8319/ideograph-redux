import { Autocomplete, Input, InputBase, Paper, Popper, styled, useAutocomplete } from "@mui/material"
import { isUndefined } from "lodash"
import { useEffect, useMemo, useRef, useState } from "react"
import { useUpdateEffect } from "react-use"
import { Constraint, PrimitiveType, primitiveTypeDefaultValue, PrimitiveTypeName } from "../../engine/ontology/Constraints"
import { VisualElementType } from "../../engine/visual/VisualElement"
import { useAppSelector } from "../../store/hooks"
import { rightPanelWidthSelector } from "../../store/slice/modelSlicer"
import { IConstraint, IPatternNode } from "../../utils/common/graph"
import { CommonModel } from "../../utils/common/model"
import { ComparisonOperator, literal2ComparisonOperator } from "../../utils/common/operator"
import { StyledButton, StyledDefaultButton, StyledLightInput } from "../Styled/StyledComponents"
import { acceptableOperatorDict, operatorDescription, operatorLiteral } from "./ConstraintField"
import './ConstraintInputField.css'
// import pinyin from 'pinyin'

const primitiveTypeDefault: Record<PrimitiveTypeName, any> = {
    "string": "*",
    "number": 0,
    "boolean": false,
}


const MonoInput = styled(StyledLightInput)(t => ({
    fontFamily: 'var(--mono-font)'
}))

const StyledPopper = styled(Popper)(t => ({
    width: 320,
}))


interface IConstraintCreateBlockProps {
    class: CommonModel.IClass,
    node: IPatternNode,
    // constraint?: IConstraint,
    onConstraintCreate: (c: {
        property: CommonModel.IProperty,
        operator: ComparisonOperator,
        value: PrimitiveType<PrimitiveTypeName>,
    }) => void,
}


// export interface IConstraintCreateBlockRef {
//     getConstraintUpdate: () => Partial<IConstraint>
// }

type WithPinyin<T> = T & {
    pinyin: string
}

// export function addPinyin<T extends {name: string}>(item: T): WithPinyin<T> {
//     return {...item, pinyin: pinyin(item.name, {
//         style: 'normal'
//     }).join("")}
// }


export const ConstraintCreateBlock = (props: IConstraintCreateBlockProps) => {

    const [constraintProperty, setConstraintProperty] = useState<CommonModel.IProperty | null>(null);
    const [propertyText, setPropertyText] = useState<string>('');

    const [constraintOperator, setConstraintOperator] = useState<ComparisonOperator | null>(null);
    const [constraintValue, setConstraintValue] = useState<PrimitiveType<PrimitiveTypeName> | null>(null);

    const rootRef = useRef<HTMLDivElement>(null);
    const propNameInputRef = useRef<HTMLInputElement>(null);
    const operatorInputRef = useRef<HTMLInputElement>(null);
    const valueInputRef = useRef<HTMLInputElement>(null);

    const [isErrorBoundary, setErrorBoundary] = useState(false);

    // const rWidth = useAppSelector(rightPanelWidthSelector)

    const [isPropNameInputFocused, setPropNameInputFocused] = useState(false);
    const [isOperatorInputFocused, setOperatorInputFocused] = useState(false);
    const [isValueInputFocused, setValueInputFocused] = useState(false);

    useEffect(() => {
        if (constraintProperty == null) return;
        if (constraintOperator != null) return;
        // operatorInputRef.current?.focus();
        setConstraintOperator(ComparisonOperator.Equal);
        setTimeout(() => {
            operatorInputRef.current?.select();
        }, 0)
    }, [constraintProperty])

    useEffect(() => {
        // console.log(constraintOperator, constraintProperty)
        if (constraintOperator == null || constraintProperty == null) return;
        // console.log(primitiveTypeDefaultValue[constraintProperty.type])
        setConstraintValue(primitiveTypeDefaultValue[constraintProperty.type]);
        // valueInputRef.current?.focus();
        valueInputRef.current?.select();
    }, [constraintOperator])

    const {
        getInputProps,
        getListboxProps,
        getOptionProps,
        groupedOptions: propOptions,
    } = useAutocomplete({
        id: 'use-autocomplete-prop',
        options: props.class.properties,//.map(addPinyin),
        getOptionLabel: p => p.name,
        value: constraintProperty,
        onChange: (ev, v) => setConstraintProperty(v),
        inputValue: propertyText,
        onInputChange: (ev, v) => setPropertyText(v),
        selectOnFocus: true,
        // filterOptions: (op, state) => {
        //     return props.class.properties.filter(
        //         it => {
        //             const py = pinyin(it.name, {
        //                 style: 'normal'
        //             }).join("")
        //         }
        //     )
        // }
    });

    return <>

        <div ref={rootRef} style={{ display: 'grid', gridTemplateColumns: '1fr 36px 1fr', columnGap: 8, margin: '8px 16px 8px 16px', border: `1px solid ${isErrorBoundary ? 'red' : 'var(--grey100)'}`, borderRadius: 3, fontFamily: 'var(--mono-family)' }}>
            {/* <Autocomplete
                // value={constraintProperty}
                // onChange={(_, newValue) => {
                //     console.log(newValue)
                //     setConstraintProperty(newValue ?? undefined);
                // }}
                // defaultValue={props.class.properties[0]}
                // inputValue={constraintProperty?.name}
                // onInputChange={(event, newInputValue) => {
                //     setConstraintProperty(props.class.properties.find(it => it.name === newInputValue));
                // }}
                id="controllable-states-demo"
                options={props.class.properties}
                getOptionLabel={o => o.name}
                placeholder="属性值"
                renderInput={(params) => <div ref={params.InputProps.ref}>
                    <MonoInput inputProps={params.inputProps}/>
                </div>}
                PaperComponent={props => {
                    return <Paper {...props} style={{ width: rWidth - 34, borderRadius: '0', background: '#1e1e1e', boxShadow: 'rgba(0, 0, 0, 0.133) 0px 6.4px 14px 0px, rgba(0, 0, 0, 0.11) 0px 1.1875px 3px 0px', }} />
                }}
                renderOption={(props, option, states) => {
                    return <li style={{
                        fontFamily: 'var(--mono-font)',
                        display: 'grid',
                        fontFeatureSettings: '"liga" 1',
                        gridTemplateColumns: '1fr 24px 1fr',
                        columnGap: 4,
                        fontSize: 13,
                        color: '#f1f2f6',
                        backgroundColor: states.selected ? 'var(--primary-darken)' : undefined,

                    }}
                        key={option.id}
                        className="constraint-intellisense-button"
                        onClick={ev => {
                            console.log(option);
                            setConstraintProperty(option);
                        }}
                    >

                        <span> {option.name}</span>
                        <span> {option.type}</span>
                    </li>
                }}
            /> */}
            <MonoInput
                placeholder="属性名"
                inputProps={getInputProps()}
                onMouseUp={ev => (ev.target as any).select()}
                onFocus={() => { setPropNameInputFocused(true); }}
                onBlur={() => {
                    setPropNameInputFocused(false);
                }}
            />

            <MonoInput placeholder="=="
                // ref={operatorInputRef}
                inputProps={{
                    ref: operatorInputRef
                }}
                // onMouseUp={ev => (ev.target as any).select()}
                value={constraintProperty ? operatorLiteral[constraintOperator ?? 0] : undefined}
                onFocus={() => { setOperatorInputFocused(true); operatorInputRef.current?.focus() }}
                onBlur={() => { setOperatorInputFocused(false); }} />

            <MonoInput placeholder="值"
                value={constraintValue === null ? "" : String(constraintValue)}
                onChange={(ev) => {
                    switch (constraintProperty?.type) {
                        case "string": {
                            setConstraintValue(ev.target.value)
                            break
                        }
                        case "number": {
                            const num = Number(ev.target.value)
                            if (!isNaN(num) && !isUndefined(num)) {
                                setConstraintValue(num)
                            }
                        }
                        case "boolean": {
                            const bool = Boolean(ev.target.value)
                            setConstraintValue(bool)
                        }
                    }
                }}
                inputProps={{ ref: valueInputRef }}
                onFocus={() => { setValueInputFocused(true); valueInputRef.current?.select() }}
                onBlur={() => { setValueInputFocused(false); }}
            />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 16, padding: 16, }}>
            <StyledDefaultButton onClick={ev => {
                setConstraintProperty(null)
                setConstraintOperator(null)
                setConstraintValue(null)
            }}>
                清空
            </StyledDefaultButton>
            <StyledButton
                onClick={ev => {
                    if (constraintProperty != null && constraintValue != null && constraintValue != "" && constraintOperator != null) {
                        props.onConstraintCreate({
                            operator: constraintOperator,
                            value: constraintValue,
                            property: constraintProperty,
                        })
                        setConstraintProperty(null)
                        setConstraintOperator(null)
                        setConstraintValue(null)
                    }
                    else {
                        if (!isErrorBoundary) {
                            setErrorBoundary(true);
                            setTimeout(() => {
                                setErrorBoundary(false);
                            })
                        }
                    }
                }}>
                添加
            </StyledButton>
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
                            style={{ fontFeatureSettings: '"liga" 1', display: 'flex', justifyContent: "space-between" }}
                            key={option.name}
                            className="constraint-intellisense-button"
                            onClick={(ev) => {
                                setConstraintProperty(option);
                                operatorInputRef.current?.focus();
                                operatorInputRef.current?.select();
                                opProps.onClick?.(ev);
                            }}>
                            <span>{option.name}</span>
                            <code style={{ color: 'rgb(0, 204, 175)' }} className="shimmed">{option.type}</code></li>
                    })}
                </ul>
            </Popper>}

        {rootRef.current
            && constraintProperty
            && <Popper
                open={isOperatorInputFocused}
                anchorEl={rootRef.current}
                style={{
                    width: (rootRef.current as HTMLDivElement)?.getBoundingClientRect().width,
                }}
                className="hint-root"
            >
                <ul style={{ margin: 0, padding: 0, }}>
                    {(acceptableOperatorDict[constraintProperty.type]).map((option, index) => {
                        return <li
                            key={option}
                            className="constraint-intellisense-button"
                            onPointerDown={ev => {
                                setConstraintOperator(option);
                                ev.stopPropagation();
                                ev.preventDefault();
                                (valueInputRef.current as HTMLInputElement)?.focus()
                            }}>
                            <span style={{ opacity: 0.25 }} className="shimmed">{constraintProperty.name}</span>
                            <span style={{ fontWeight: 600 }}>{operatorLiteral[option]}</span>
                            <span style={{ opacity: 0.25 }} className="shimmed">({operatorDescription[option]})</span>
                        </li>
                    })}
                </ul>
            </Popper>}
    </>
}
