import { operatorLiteral } from "../components/ConstraintsEditor/ConstraintField";
import { VisualElementType } from "../engine/visual/VisualElement";
import { PrimitiveType } from "./common/data";
import { EdgeDirection, IConstraint } from "./common/graph";
import { CommonModel } from "./common/model";
import { BinaryLogicOperator, ComparisonOperator, LogicOperator, UnaryLogicOperator } from "./common/operator";

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
        id: string,
        // position?: IPoint,
        targetType: VisualElementType,
        targetId: string,
        expression?: string,
        property?: CommonModel.IProperty,
        operator?: ComparisonOperator,
        value?: PrimitiveType,
    }

    export interface IPropertyLogic {
        logicType: LogicOperator,
        subClause: (IPropertyLogic | IPropertyClause)[]
    }

    export type IPropertyConstraint = IPropertyClause | IPropertyLogic


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

    const IRPropSyntax2Cypher = (irProp: IPropertyConstraint): string => {
        switch ((irProp as IPropertyLogic).logicType) {
            case BinaryLogicOperator.And:
                return `(${IRPropSyntax2Cypher((irProp as IPropertyLogic).subClause[0])}) AND (${IRPropSyntax2Cypher((irProp as IPropertyLogic).subClause[1])})`
            case BinaryLogicOperator.Or:
                return `(${IRPropSyntax2Cypher((irProp as IPropertyLogic).subClause[0])}) OR (${IRPropSyntax2Cypher((irProp as IPropertyLogic).subClause[1])})`
            case UnaryLogicOperator.Not:
                return `!(${IRPropSyntax2Cypher((irProp as IPropertyLogic).subClause[0])})`
            default:
                {
                    const ip = irProp as IPropertyClause
                    return `${ip.targetId}.${ip.property?.name} ${operatorLiteral[ip.operator ?? 0]} ${ip.value}`
                }
        }
    }


    export const IR2Cypher = (ir: IdeographIR.IRepresentation): string => {
        if (ir.structureConstraint.paths.length <= 0) return "";
        const mainPath = `MATCH ${IRPath2Cypher(ir.structureConstraint.paths[0])}\n`;
        if (ir.structureConstraint.paths.length <= 1) return mainPath;

        // TODO: immutable?
        const compositePaths = ir.structureConstraint.paths.slice(1).map(p => `WHERE EXISTS {\n    ${IRPath2Cypher(p)}\n}\n`).join("AND ");
        const propertySyntax = ir.propertyConstraint ? `WHERE {\n\t${IRPropSyntax2Cypher(ir.propertyConstraint)}\n}\n` : ''
        const returnSyntax = 'RETURN ()'
        return mainPath + compositePaths + propertySyntax + returnSyntax;
    }

}



