import { Schema, SomeJTDSchemaType } from 'ajv/dist/core';
import { ColorSlot } from '../visual/ColorSlot';
import { PrimitiveTypeName } from './Constraints';
import { IOntologyModel } from './OntologyModel';


export interface ISchemaProperty {
    name: string,
    type: PrimitiveTypeName,
    nullable?: boolean,
}

/**
 * Ontology classes, should NOT consider composed class (AND / OR)
 */
export interface IOntologyClass<T extends ISchemaProperty = ISchemaProperty> {
    className: string,
    displayName: string,
    derivedFrom?: IOntologyClass<T>,  // TODO: Consider multiple derives?
    derievingTo?: IOntologyClass<T>[],
    schema: ISchemaProperty[],
    uuid: string | number
}


export type ColoredOntologyClass<T extends ISchemaProperty = ISchemaProperty> = Omit<IOntologyClass<T>, 'derivedFrom' | "derivingTo"> & {
    colorSlot: ColorSlot
}
