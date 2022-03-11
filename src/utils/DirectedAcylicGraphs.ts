import { isNumber } from "lodash";
import { CommonModel } from "./common/model";

type NumberOrRange = number | [number, number];

const isValid = (nor: NumberOrRange, value: number) => {
    if (isNumber(nor)) {
        return value === nor;
    }
    else {
        return value <= nor[1] && value >= nor[0]
    }
}

interface IAnchoredDagNode
    <T extends CommonModel.IIdentifiable = CommonModel.IIdentifiable>
    extends CommonModel.IIdentifiable {

    inRequired: number,
    outRequired: number,
    in: T[],
    out: T[],

}

export const siftDag = <T extends IAnchoredDagNode>(nodes: T[]) => {

}