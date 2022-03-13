import { EdgeDirection } from "./common/graph";
import { LogicOperator } from "./common/operator";

export namespace IdeographIR {

    export interface IRepresentation {
        structureConstraint: IStructureConstraint;
        propertyConstraint: IPropertyConstraint | null;
    }


    export interface INode {
        alias: string;
        type: string;

    }

    export enum Direction {
        Default = 0,
        Reversed = 1,
        Any = 2,
    }

    export interface ILink {
        direction: Direction[];
        alias: string;
    }

    // order-aware 0->1->2->
    export interface IPath {
        nodes: INode[];
        directionToNext: Direction[];
    }

    export interface IStructureConstraint {
        paths: IPath[];
    }


    export interface IPropertyClause {

    }

    export interface IPropertyLogic {
        logicType: LogicOperator,
        subClause: (IPropertyLogic | IPropertyClause)[]
    }

    export interface IPropertyConstraint {
        root: IPropertyClause | IPropertyLogic
    }


    const IRPath2Cypher = (irPath: IPath): string => {
        return irPath.nodes.map(
            (n, i) => {
                if (i === irPath.nodes.length - 1) {
                    return `(${n.alias ?? ""}:${n.type})`
                }
                const arrowText = irPath.directionToNext[i] === Direction.Default ? "-->"
                    : irPath.directionToNext[i] === Direction.Reversed ? "<--" : "--"
                return `(${n.alias ?? ""}:${n.type})` + arrowText;
            }
        ).join('');
    }


    export const IR2Cypher = (ir: IdeographIR.IRepresentation): string => {
        if (ir.structureConstraint.paths.length <= 0) return "";
        const mainPath = `MATCH ${IRPath2Cypher(ir.structureConstraint.paths[0])}\n`;
        if (ir.structureConstraint.paths.length <= 1) return mainPath;

        // TODO: immutable?
        const compositePaths = ir.structureConstraint.paths.slice(1).map(p => `WHERE EXISTS {\n    ${IRPath2Cypher(p)}\n}\n`).join("AND ");
        return mainPath + compositePaths;
    }

}



