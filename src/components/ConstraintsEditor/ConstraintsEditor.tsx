import { Dropdown, Separator, TextField } from "@fluentui/react"
import { useMemo, useState } from "react"
import { ColoredOntologyClass, IOntologyClass } from "../../engine/ontology/OntologyClass"
import { ideographDarkTheme, ideographMonoTheme } from "../../utils/ideographTheme"

export interface IConstraintsEditorProps {
    ontologyClass: ColoredOntologyClass
}

const operatorDicts = {
    string: ['==', '!=', '~='],
    number: ['==', '>=', '<=', '!='],
}

export const ConstraintsEditor = (props: IConstraintsEditorProps) => {
    const propertyOptions = props.ontologyClass.schema.map(it => ({
        key: it.name,
        text: it.name,
        type: it.type
    }))

    const [selectedProperty, setSelectedProperty] = useState<{ key: string, text: string, type: string }>();

    const typeOperators = useMemo(() => {
        if (selectedProperty?.key) {
            return operatorDicts[(props.ontologyClass.schema as any).properties[selectedProperty.key].type as 'string' | 'number'].map(it => ({ key: it, text: it }));
        }
        return []
    }, [selectedProperty?.key])

    return <div style={{ display: 'grid', gridTemplateColumns: '3fr 1px 2fr 1px 2fr', margin: '16px 16px', maxWidth: '100%', boxSizing: 'border-box', border: '1px solid #e1e2e5' }}>
        <Dropdown
            options={propertyOptions}
            styles={{ root: { minWidth: 0 }, title: { border: 'none' } }}
            onChange={(ev, op: any) => { setSelectedProperty(op) }} />
        <div style={{ height: '100%', width: 1, backgroundColor: '#e1e2e5' }} />
        <Dropdown options={typeOperators}
            calloutProps={{
                theme: ideographMonoTheme,
                styles: { root: { fontFamily: 'JetBrains Mono', fontFeatureSettings: '"liga" 1' } }
            }}
            styles={{
                root: { minWidth: 0, fontFamily: 'JetBrains Mono', fontFeatureSettings: '"liga" 1', border: 'none' },
                title: { border: 'none' }
            }}
            theme={ideographMonoTheme}
        />
        <div style={{ height: '100%', width: 1, backgroundColor: '#e1e2e5' }} />
        <TextField styles={{ fieldGroup: { border: 'none' }, }} />

    </div>
}