import axios from "axios"
import _ from "lodash";
import { figmaColorScheme } from "../engine/visual/ColorSchemes";
import { ColorSlot } from "../engine/visual/ColorSlot";
import { PrimitiveTypeName } from "../utils/common/data";
import { EdgeDirection } from "../utils/common/graph";
import { CommonModel } from "../utils/common/model";
import { serverUrl } from "./SolvePattern";

export namespace Schema {

    export interface Entry {
        conceptNodes: Node[];
        propertyNodes: Node[];
        hasPropertyEdges: HasEdge[];
        hasRelationConceptEdges: HasEdge[];
        hasSubConceptEdges: HasEdge[];
    }

    export interface Node {
        _id: string;
        name: string;
        nodeId: number;
        nodeLabel: NodeLabel;
        label: null;
        type: null;
        labels: null;
        types: string;
        tags: null;
        judgeParent: boolean;
    }

    export enum NodeLabel {
        Concept = "Concept",
        Property = "Property",
        Relation = "Relation",
    }

    export interface HasEdge {
        _id: string;
        fromId: number;
        toId: number;
        edgeId: number;
        relationId: number;
        name: string;
    }

}

export const fetchSchema = async () => {
    const schema = await axios.get<Schema.Entry>(`${serverUrl}/schema`)
    return schema.data;
}


const getTreeLikeClassesAndTheirRefMap = (originalClasses: CommonModel.IColoredClass[], hasSubConceptEdges: Schema.HasEdge[]) => {
    let clonedClasses = _.cloneDeep(originalClasses);
    const refMap = new Map<CommonModel.IdType, CommonModel.IColoredClass>(
        clonedClasses.map((it) => [it.id, it])
    );
    const refPairs = hasSubConceptEdges.map(e => {
        if (e.fromId >= 0 && e.toId >= 0) {
            const toIndex = clonedClasses.findIndex(it => it.id === e.fromId);
            const fromIndex = clonedClasses.findIndex(it => it.id === e.toId);
            if (toIndex !== -1 && fromIndex !== -1 && toIndex !== fromIndex) {
                const toRef = clonedClasses[toIndex];
                const fromRef = clonedClasses[fromIndex];
                return [toRef, fromRef]
            }
        }
        return undefined
    }).filter(it => it !== undefined) as [CommonModel.IColoredClass, CommonModel.IColoredClass][]
    refPairs.forEach(([from, to]) => {
        if (from.children === undefined) {
            from.children = [to]
        } else {
            from.children!.push(to)
        }
        clonedClasses = clonedClasses.filter(it => it !== to)
    })
    return {
        clonedClasses,
        refMap
    };
}


function zip<T1, T2>(arr1: T1[], arr2: T2[]): [T1, T2][] {
    return arr1.flatMap(e1 => arr2.map(e2 => [e1, e2] as [T1, T2]))
}

const getAllDerievedRelations = (
    fromId: CommonModel.IdType,
    toId: CommonModel.IdType,
    refMap: Map<CommonModel.IdType, CommonModel.IColoredClass>,
): [CommonModel.IdType, CommonModel.IdType][] => {
    const fromRef = refMap.get(fromId);
    const toRef = refMap.get(toId);

    if (fromRef && toRef) {
        const fromChildrenIds = (fromRef.children?.map(it => it.id) ?? []);
        const toChildrenIds = (toRef.children?.map(it => it.id) ?? []);


        const childrenEdges = zip(fromChildrenIds, toChildrenIds).flatMap(pair =>
            getAllDerievedRelations(
                pair[0],
                pair[1],
                refMap
            )
        )
        const from2ToChildren = toChildrenIds.map(it => [fromId, it] as [CommonModel.IdType, CommonModel.IdType]);
        const fromChildren2To = fromChildrenIds.map(it => [it, toId] as [CommonModel.IdType, CommonModel.IdType]);
        
        return childrenEdges.concat(from2ToChildren, fromChildren2To, [[fromId, toId]])
    }
    return [];
}

export const schemaToCommonModel = (entry: Schema.Entry, name?: string): CommonModel.ISerializedRoot => {

    const properties: CommonModel.IProperty[] = entry.propertyNodes.map((pn) => {
        return {
            id: pn.nodeId,
            name: pn.name,
            type: PrimitiveTypeName.String,
        }
    })

    const classes: CommonModel.IColoredClass[] = entry.conceptNodes.map((cn, i) => {
        return {
            id: cn.nodeId,
            name: cn.name,
            properties: [],
            colorSlot: new ColorSlot(figmaColorScheme[i % figmaColorScheme.length]).asObject(),
        }
    })

    const { clonedClasses, refMap } = getTreeLikeClassesAndTheirRefMap(classes, entry.hasSubConceptEdges);


    const classHashmap: Record<string, [CommonModel.IdType, number]> = _.keyBy(classes.map((c, index) => [c.id, index]), c => c[0]);
    const propHashmap = _.keyBy(properties, p => p.id);


    entry.hasPropertyEdges.forEach(pe => {
        const fromClass = classHashmap[String(pe.fromId)]
        if (fromClass) {
            classes[fromClass[1]]?.properties.push(
                propHashmap[String(pe.toId)]
            );

        }
    })

    // const relations: CommonModel.IRelation[] = entry.hasRelationConceptEdges.map((rce) => {
    //     return {
    //         id: rce._id,
    //         from: rce.fromId,
    //         to: rce.toId,
    //         direction: EdgeDirection.Specified,
    //         name: rce.name
    //     }
    // })

    const relationsWithDerived: CommonModel.IRelation[] = entry.hasRelationConceptEdges.flatMap(e => {
        const allDerieved = getAllDerievedRelations(
            e.fromId,
            e.toId,
            refMap
        )
        return allDerieved.map(p => ({
            id: e._id,
            from: p[0],
            to: p[1],
            direction: EdgeDirection.Specified,
            name: e.name
        }))
    })

    return {
        name: String(name),
        classes,
        relations: relationsWithDerived,
        tree: clonedClasses,
    }
}