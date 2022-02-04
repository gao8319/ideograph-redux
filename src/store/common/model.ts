import { Dictionary } from "@reduxjs/toolkit";
import _, { isNumber } from "lodash";
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

    type IdType = PropertyKey

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
        public readonly classDict: Dictionary<IClass>;
        public readonly relations: IRelation[];

        public connectable: Record<IdType, { to: IdType[], from: IdType[] }>;

        constructor(name: string, classes: IClass[], relations: IRelation[]) {

            this.name = name;
            this.classes = classes;
            this.classDict = _.keyBy(classes, it => it.id)
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
        }

        private $classIdSelector = (c: IClass) => c.id;

        public get classesByTreeView() {
            const disjointSet = new DisjointSet(this.$classIdSelector);
            disjointSet.makeSetByArray(this.classes);
            // debugger
            this.classes.forEach(
                c => {
                    if (c.parent !== undefined && c.parent !== null) {
                        const p = this.classDict[String(c.parent)]
                        p && disjointSet.union(p, c)
                    }
                }
            )
            return disjointSet.parents;
        }

        // Deprecated
        public static fromOntologyModel<N, E>(
            name: string,
            nodes: N[],
            edges: E[],
            transforms: {
                inferNodeType: (n: N) => OntologyNodeType | undefined,
                inferEdgeType: (e: E) => OntologyEdgeType | undefined,

                inferPropertyParent: (e: E) => IdType,
                inferProperty: (e: E) => IProperty,
                inferRelationProperties: (e: E) => { from: IdType, to: IdType, direction: EdgeDirection }

                identifyNode: (n: N) => IdType,
                identifyEdge: (e: E) => IdType,

                nameNode?: (n: N) => string,
                nameEdge?: (e: E) => string,
            }
        ): Root {
            const {
                inferEdgeType,
                inferNodeType,
                inferPropertyParent,
                inferProperty,
                identifyEdge,
                identifyNode,
                nameEdge,
                nameNode,
                inferRelationProperties
            } = transforms;
            const {
                [OntologyNodeType.Concept]: concepts,
                [OntologyNodeType.Property]: properties
            } = _.groupBy(nodes, inferNodeType)

            const {
                [OntologyEdgeType.HasProperty]: propertyLinks,
                [OntologyEdgeType.HasRelationConcept]: connectLinks,
                [OntologyEdgeType.HasSubConcept]: deriveLinks
            } = _.groupBy(edges, inferEdgeType)

            const propertyDict: Record<PropertyKey, [E, ...E[]]> = _.groupBy(propertyLinks, inferPropertyParent) as any

            const classes: IClass[] = concepts.map(
                con => {
                    const id = identifyNode(con)
                    return {
                        id,
                        name: nameNode?.(con) ?? String(id),
                        properties: propertyDict[id]?.map(inferProperty) ?? []
                    }
                }
            );

            const relations = connectLinks.map(
                link => {
                    const id = identifyEdge(link)
                    return {
                        id,
                        name: nameEdge?.(link) ?? String(id),
                        ...inferRelationProperties(link)
                    }
                }
            )

            return new Root(
                name,
                classes,
                relations
            )
        }

    }

}