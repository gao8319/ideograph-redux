import { IOntologyClass, ISchemaProperty } from "../../engine/ontology/OntologyClass";
import './ConstraintInputField.css'
import InputBase from '@mui/material/InputBase';
import { useEffect, useRef, useState } from "react";
import { makeStyles, Popper, styled, useAutocomplete } from "@mui/material";
import { ideographDarkTheme } from "../../utils/ideographTheme";
import { BinaryOperator, PrimitiveType, PrimitiveTypeName } from "../../engine/ontology/Constraints";

interface IConstraintInputFieldProps {
    ontogyClass: IOntologyClass,
    containerProps?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
}

const ConstraintBlockInput = styled(InputBase)(({ theme }) => ({
    // margin: '0 4px',
    fontSize: 14,
    fontFamily: 'var(--font)',
    height: '100%',
}))

const ConstraintBlockInputMono = styled(InputBase)(({ theme }) => ({
    // margin: '0 4px',
    fontSize: 14,
    fontFamily: 'var(--mono-font)',
    height: '100%',
    fontFeatureSettings: '"liga" 1',
}))

const operatorDescription = {
    "==": "等于",
    ">=": "大于等于",
    "<=": "小于等于",
    ">": "大于",
    "<": "小于",
    "!=": "不等于",
    "~=": "匹配正则表达式",
}


const acceptableOperatorDict: Required<Record<PrimitiveTypeName, BinaryOperator[]>> = {
    "string": [BinaryOperator.Equals, BinaryOperator.NotEquals, BinaryOperator.Matches],

    "number": [BinaryOperator.Equals, BinaryOperator.Less, BinaryOperator.LessOrEquals,
    BinaryOperator.Greater, BinaryOperator.GreaterOrEquals, BinaryOperator.NotEquals],

    "boolean": [BinaryOperator.Equals, BinaryOperator.NotEquals],
}

export const ConstraintInputField = (props: IConstraintInputFieldProps) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const [isFocused, setFocused] = useState<boolean>(true);
    const onInputFocus = () => setFocused(true);
    const onInputBlur = () => setFocused(false);


    const {
        getInputProps,
        getListboxProps,
        getOptionProps,
        groupedOptions,
    } = useAutocomplete({
        id: 'property-name-input',
        options: props.ontogyClass.schema,
        getOptionLabel: (prop) => prop.name
    });

    const operatorInputRef = useRef<HTMLInputElement>(null);
    const valueInputRef = useRef<HTMLInputElement>(null);
    const [isOperatorInputFocused, setOperatorInputFocused] = useState(false);
    const [selectedOperator, setSelectedOperator] = useState<BinaryOperator | undefined>(undefined);
    const [selectedProperty, setSelectedProperty] = useState<ISchemaProperty | null>(null);

    return <>
        <div {...props.containerProps} style={props.containerProps} className={"constraint-input-root" + (isFocused ? " input-activated" : '')} ref={rootRef}>
            <ConstraintBlockInput
                // autoFocus
                inputProps={getInputProps()}
                placeholder="属性名"
                onFocus={onInputFocus}
                onBlur={onInputBlur} />
            <ConstraintBlockInputMono
                inputProps={{ ref: operatorInputRef }}
                placeholder="=="
                onFocus={() => { setFocused(true); setOperatorInputFocused(true); }}
                onBlur={() => { setFocused(false); setOperatorInputFocused(false); }}
                value={selectedOperator}/>
            <ConstraintBlockInputMono
                placeholder="..."
                inputProps={{ ref: valueInputRef }}
                onFocus={onInputFocus}
                onBlur={onInputBlur} />
        </div>

        {rootRef.current
            && groupedOptions.length > 0
            && !isOperatorInputFocused
            && <Popper open={isFocused} anchorEl={rootRef.current} style={{
                width: (rootRef.current as HTMLDivElement).getBoundingClientRect().width,
                maxHeight: 320,
                background: '#f8f9fa',
                fontSize: 14,
                padding: '8px 0',
                border: '1px solid #e1e2e5',
                borderTop: 'none',
                overflow: 'auto',
            }}>
                <ul {...getListboxProps()} style={{ margin: 0, padding: 0, }}>
                    {(groupedOptions as ISchemaProperty[]).map((option, index) => {
                        const opProps = getOptionProps({ option, index })
                        return <li {...opProps}
                            key={option.name}
                            style={{
                                width: '100%',
                                height: 28,
                                alignItems: 'center',
                                padding: '0 8px',
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}
                            className="constraint-intellisense-button"
                            onClick={(ev) => {
                                (operatorInputRef.current as HTMLInputElement).focus()
                                opProps.onClick?.(ev)
                                setSelectedProperty(option)
                            }}>
                            <span>{option.name}</span>
                            <code style={{ opacity: 0.25 }} className="shimmed">{option.type}</code></li>
                    })}
                </ul>
            </Popper>}

        {
            rootRef.current
            && isOperatorInputFocused
            && selectedProperty
            && <Popper
                open={isOperatorInputFocused}
                anchorEl={rootRef.current}
                style={{
                    width: (rootRef.current as HTMLDivElement).getBoundingClientRect().width,
                    maxHeight: 320,
                    background: '#f8f9fa',
                    fontSize: 14,
                    padding: '8px 0',
                    border: '1px solid #e1e2e5',
                    borderTop: 'none',
                    overflow: 'auto',
                }}>
                {
                    (acceptableOperatorDict[selectedProperty.type])
                        .map((option, index) => {
                            return <div
                                style={{
                                    width: '100%',
                                    height: 28,
                                    alignItems: 'center',
                                    fontFamily: 'var(--mono-font)',
                                    padding: '0 8px',
                                    display: 'grid',
                                    fontFeatureSettings: '"liga" 1',
                                    gridTemplateColumns: '1fr 32px 1fr'
                                }}
                                key={option}
                                className="constraint-intellisense-button"
                                onClick={(ev) => {
                                    console.log("XDCFGHJK")
                                    // console.log("!!!", option);
                                    // setSelectedOperator(option);
                                    ev.preventDefault();
                                }}>
                                <span style={{ opacity: 0.25 }} className="shimmed">{selectedProperty.name}</span>
                                <span style={{ fontWeight: 600 }}>{option}</span>
                                <span style={{ opacity: 0.25, textAlign: 'right' }} className="shimmed">({operatorDescription[option]})</span>
                            </div>
                        })}
            </Popper>
        }
    </>
}