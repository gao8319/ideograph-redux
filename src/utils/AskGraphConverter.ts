// import { Dictionary } from "@reduxjs/toolkit";
// import _, { isNumber, iteratee } from "lodash";
// import { PrimitiveTypeName } from "./common/data";
// import { EdgeDirection } from "./common/graph";
// import { CommonModel } from "./common/model";
// import { AskGraph } from "./AskGraph";




// export const convertAskGraphOntModel = (ontModel: AskGraph.RootModel): CommonModel.ISerializedRoot => {
//     const nodeGroups: Record<string, AskGraph.Node[]> = _.groupBy(ontModel.nodes, n => n.type);
//     const edgeGroups: Record<string, AskGraph.Edge[]> = _.groupBy(ontModel.edges, n => n.type);

//     const concepts: Record<number, AskGraph.Node & Record<string, any>> = _.keyBy(nodeGroups.concept.map(
//         it => ({ ...it, PROPERTY: [], CHILDREN: [], TO: [], FROM: [] }))
//         , n => n.id)
//     const properties: Record<number, CommonModel.IProperty> = _.keyBy(nodeGroups.property.map(
//         p => ({
//             type: PrimitiveTypeName.String,
//             name: p.name,
//             _id: p.id,
//             id: String(p.id)
//         })
//     ), n => n._id)

//     edgeGroups.HAS_PROPERTY.forEach(
//         e => {
//             if (e.from == null || e.to == null) return;
//             concepts[e.from]?.PROPERTY?.push(properties[e.to]!);
//         }
//     )

//     edgeGroups.HAS_SUB_CONCEPT.forEach(
//         e => {
//             // console.log(e);
//             if (e.from == null || e.to == null) return;
//             if (concepts[e.from] && concepts[e.to]) {
//                 concepts[e.from]?.CHILDREN?.push(concepts[e.to]?.id);
//                 Object.assign(concepts[e.to], { PARENT: e.from })
//             }
//         }
//     )

//     // edgeGroups.HAS_RELATION_CONCEPT.forEach(
//     //     e => {
//     //         if (e.from == null || e.to == null) return;
//     //         concepts[e.from]?.TO?.push(concepts[e.to]?.id);
//     //         concepts[e.to]?.FROM?.push(concepts[e.from]?.id);
//     //     }
//     // )
//     const name = "medical.askgraph.xyz.model";
//     const classes = Object.entries(concepts).map(e => {
//         const c = e[1]
//         return {
//             id: c.id,
//             name: c.name,
//             properties: c.PROPERTY,
//             parent: c.PARENT,
//             children: c.CHILDREN
//         }
//     });
//     const relations = edgeGroups.HAS_RELATION_CONCEPT.filter(
//         r => isNumber(r.to) && isNumber(r.from) && concepts[r.from!] && concepts[r.to!]
//     ).map(r => ({
//         from: r.from!,
//         to: r.to!,
//         direction: EdgeDirection.Specified,
//         id: r.id,
//         name: `${concepts[r.from!]?.name}->${concepts[r.to!]?.name}`
//     }));


//     // const model = new CommonModel.Root(
//     //     "first.askgraph.xyz.model",
//     //     Object.entries(concepts).map(e => {
//     //         const c = e[1]
//     //         return {
//     //             id: c.id,
//     //             name: c.name,
//     //             properties: c.PROPERTY,
//     //             parent: c.PARENT,
//     //             children: c.CHILDREN,
//     //         }
//     //     }),
//     //     ,
//     // );
//     return {name, classes: classes as any, relations}
// }


