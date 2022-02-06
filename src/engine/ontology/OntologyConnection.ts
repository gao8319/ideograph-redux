import { Schema } from "ajv";
import { IOntologyClass } from "./OntologyClass";


export enum ConnectDirection {
    Unspecified,
    Specified,
}

export interface IOntologyConnection<UUID extends string | number = number> {
    from: UUID,
    to: UUID,
    direction: ConnectDirection,
    displayName: string,
    // className: string,
    uuid: string | number,
    schema?: Schema
}