import axios from "axios"
import _ from "lodash";
import { figmaColorScheme } from "../engine/visual/ColorSchemes";
import { ColorSlot } from "../engine/visual/ColorSlot";
import { PrimitiveTypeName } from "../utils/common/data";
import { EdgeDirection } from "../utils/common/graph";
import { CommonModel } from "../utils/common/model";

export namespace Schema {

    export interface Entry {
        conceptNodes: Node[];
        propertyNodes: Node[];
        hasPropertyEdges: HasEdge[];
        hasRelationConceptEdges: HasEdge[];
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
    const schema = await axios.get<Schema.Entry>('/api/schema')
    return schema.data;
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
            colorSlot: new ColorSlot(figmaColorScheme[i]).asObject(),
        }
    })

    const classHashmap: Record<string, [CommonModel.IdType, number]> = _.keyBy(classes.map((c, index)=>[c.id, index]), c => c[0]);
    const propHashmap = _.keyBy(properties, p => p.id);
    entry.hasPropertyEdges.forEach(pe => {
        classes[classHashmap[String(pe.fromId)][1]]?.properties.push(
            propHashmap[String(pe.toId)]
        )
    })

    const relations: CommonModel.IRelation[] = entry.hasRelationConceptEdges.map((rce) => {
        return {
            id: rce._id,
            from: rce.fromId,
            to: rce.toId,
            direction: EdgeDirection.Specified,
            name: rce.name
        }
    })

    console.log({
        name: String(name),
        classes,
        relations
    })

    return {
        name: String(name),
        classes,
        relations
    }
}