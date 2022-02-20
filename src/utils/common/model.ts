import { Dictionary } from "@reduxjs/toolkit";
import _, { isNumber } from "lodash";
import { figmaColorScheme } from "../../engine/visual/ColorSchemes";
import { ColorSlot, IColorSlot } from "../../engine/visual/ColorSlot";
import { PrimitiveTypeName } from "./data";
import { DisjointSet } from "./disjoint";
import { EdgeDirection } from "./graph";


// deprecated
export enum OntologyNodeType {
    Concept,
    Property,
}

// deprecated
export enum OntologyEdgeType {
    HasProperty,
    HasSubConcept,
    HasRelationConcept,
}

export namespace CommonModel {

    type IdType = Exclude<PropertyKey, symbol>

    interface IIdentifiable {
        id: IdType,
    }

    interface INamable {
        name: string,
    }


    export interface IRoot extends INamable {
        classes: IClass[],
        relations: IRelation[],
    }

    export interface IClass extends IIdentifiable, INamable {
        properties: IProperty[],
        parent?: IdType,
        children?: IdType[],
    }

    export type IColoredClass = IClass & {
        colorSlot: IColorSlot,
    }

    export interface IEdgeClass extends IIdentifiable, INamable{
        from: IClass,
        to: IClass,
        properties: IProperty[],
        specificType?: string,
    }

    export interface IColoredEdgeClass extends IIdentifiable, INamable{
        from: IColoredClass,
        to: IColoredClass,
        properties: IProperty[],
        specificType?: string,
    }

    export const getEdgeClassIdentifier = (ec: IEdgeClass)=> `${ec.from.id}->${ec.to.id}`
    export const getEdgeClassName = (ec: IEdgeClass)=> `${ec.from.name}->${ec.to.name}`
    
    // export interface IClassTreeLike extends IIdentifiable, INamable {
    //     properties: IProperty[],
    //     parent?: IClassTreeLike,
    //     children?: IClassTreeLike[],
    // }

    export interface IRelation extends IIdentifiable, INamable {
        from: IdType,
        to: IdType,
        direction: EdgeDirection
    }

    export interface IProperty extends IIdentifiable, INamable {
        type: PrimitiveTypeName,
        nullable?: boolean
    }

    export class Root implements IRoot {
        public readonly name: string;
        public readonly classes: IClass[];
        public readonly relations: IRelation[];

        public connectable: Record<IdType, { to: IdType[], from: IdType[] }>;
        public colorSlots: Record<IdType, IColoredClass>;

        constructor(name: string, classes: IClass[], relations: IRelation[]) {

            this.name = name;
            this.classes = classes;
            // this.classDict = _.keyBy(classes, it => it.id)
            this.relations = relations;

            this.connectable = Object.fromEntries(classes.map(
                c => [c.id, { from: [], to: [] }]
            ))

            relations.forEach(
                r => {
                    this.connectable[r.from]?.to.push(r.to);
                    this.connectable[r.to]?.from.push(r.from);
                }
            );

            this.connectable = _.mapValues(this.connectable,
                c => ({ from: _.uniq(c?.from), to: _.uniq(c?.to) })
            )

            console.log(this.connectable);

            this.colorSlots = Object.fromEntries(classes.map(
                (c, index) => [c.id, { colorSlot: new ColorSlot(figmaColorScheme[index]).asObject(), ...c }]
            ))
        }

        private $classIdSelector = (c: IClass) => c.id;

        public get classesByTreeView() {
            const disjointSet = new DisjointSet(this.$classIdSelector);
            disjointSet.makeSetByArray(this.classes);
            // debugger
            this.classes.forEach(
                c => {
                    if (c.parent !== undefined && c.parent !== null) {
                        const p = this.colorSlots[String(c.parent)]
                        p && disjointSet.union(p, c)
                    }
                }
            )
            return disjointSet.parents;
        }
    }


    export interface ISerializedRoot {
        name: string, classes: IColoredClass[], relations: IRelation[]
    }

    export const deserializeFromObject = (json: ISerializedRoot) => new Root(json.name, json.classes, json.relations)

    export const serializeToObject = (root: Root) => ({ name: root.name, classes: Object.values(root.colorSlots), relations: root.relations })
}