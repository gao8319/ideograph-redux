import { IOntologyClass } from "./OntologyClass";
import { IOntologyConnection } from "./OntologyConnection";

export interface IOntologyModel {
    baseClasses: IOntologyClass[],
    connections: IOntologyConnection[],
    profileName: string,
}

const flattenOntologyClass = (oc: IOntologyClass): IOntologyClass[] => {
    if (oc.derievingTo?.length) return [...oc.derievingTo, oc];
    return [oc]
}

export const flattenOntologyTree = (model: IOntologyModel): IOntologyClass[] => {
    return model.baseClasses.flatMap(it => flattenOntologyClass(it))
}