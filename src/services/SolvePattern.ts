import axios from "axios";
import { patternHistoryForage } from "../utils/global/Storage";
import { Solution } from "./PatternSolution";

export type SolvePatternRequest = Solution.Pattern
export type SolveCompositePatternRequest = Solution.CompositePattern
export type SolveCompositePatternRequestWithAggregation = Solution.CompositePatternWithAggregation

export type SolvePatternResponse = {
    solutions: Solution.PatternSolution[],
    elapsedTimeInMillis: number,
    message: string | null | undefined
}

export type AggregatedSolvePatternResponse = {
    solutions: Solution.AggregatedPatternSolution[],
    elapsedTimeInMillis: number,
    message: string | null | undefined
}


export const testPattern3 = {
    "nodes": [
        {
            "patternId": "A",
            "type": "报警人"
        },
        {
            "patternId": "B",
            "type": "急救报警"
        },
        {
            "patternId": "C",
            "type": "急救报警"
        }
    ],
    "edges": [
        {
            "patternId": "e0",
            "type": "发起",
            "fromPatternId": "A",
            "toPatternId": "B"
        },
        {
            "patternId": "e2",
            "type": "发起",
            "fromPatternId": "A",
            "toPatternId": "C"
        }
    ],
    "constraints": [
        {
            "patternId": "c0",
            "targetType": "Node",
            "targetPatternId": "A",
            "property": "呼叫人*",
            "operator": "MatchRegex",
            "value": "李.+"
        },
        {
            "patternId": "c1",
            "targetType": "Node",
            "targetPatternId": "A",
            "property": "联系电话",
            "operator": "MatchRegex",
            "value": "15[0-9].+"
        },
        {
            "patternId": "c2",
            "targetType": "Node",
            "targetPatternId": "B",
            "property": "流水号*",
            "operator": "MatchRegex",
            "value": "2019[0-9]+"
        }
    ]
}

export const serverUrl = "/api"  //"http://cc.qk0.cc:9160"

export const querySolvePattern = async (pattern: SolvePatternRequest) => {
    const response = await axios.post<SolvePatternResponse>(`${serverUrl}/solvePattern`, pattern)
    return response.data
}

export const querySolveCompositePattern = async (pattern: SolveCompositePatternRequest) => {
    // postMessage(pattern);
    // console.log(pattern)
    const response = await axios.post<SolvePatternResponse>(`${serverUrl}/solveCompositePattern`, pattern)
    return response.data
}


export const querySolveCompositePatternWithAggregation = async (pattern: SolveCompositePatternRequestWithAggregation) => {
    // postMessage(pattern);
    // console.log(pattern)
    const response = await axios.post<AggregatedSolvePatternResponse>(`${serverUrl}/solveCompositePatternWithAggregation`, pattern)
    return response.data
}