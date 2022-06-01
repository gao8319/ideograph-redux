import { EntityAdapter, EntityState } from "@reduxjs/toolkit";
import axios from "axios";
import localforage from "localforage";
import _ from "lodash";
import { Solution } from "../../services/PatternSolution";
import { SolvePatternResponse } from "../../services/SolvePattern";
import { ConstraintsState } from "../../store/slice/constraintSlicer";
import { IConstraint, IPatternEdge, IPatternNode } from "../common/graph";
import { IConstraintContext } from "../PatternContext";

type TypedForage<T> = LocalForage;

export const queryForage: TypedForage<QueryForageItem> = localforage.createInstance({ name: "query" })
export const dataSourceForage = localforage.createInstance({ name: "datasource" })
export const patternHistoryForage = localforage.createInstance({ name: "history" })


export const initDatabase = async () => {

    const conf = await axios.get<Record<string, DataSourceForageItem>>("static/databaseConfiguration.json")

    Object.entries(conf.data).forEach(async entry => {
        if (!(await dataSourceForage.getItem<DataSourceForageItem>(entry[0]))) {
            dataSourceForage.setItem<DataSourceForageItem>(entry[0], entry[1])
        }
    })
    
    return {
        query: queryForage,
        dataSource: dataSourceForage,
        patternHistory: patternHistoryForage
    }
}

// const ideographDatabase: IdeographDatabase = await initDatabase();

export type IdeographDatabase = Awaited<ReturnType<typeof initDatabase>>


export const getAll = async <T>(forage: LocalForage): Promise<T[]> => {
    const keys = await forage.keys();
    const promises = keys.map(
        async (k): Promise<T> => {
            const value: T = (await forage.getItem<T>(k))!;
            return value
        }
    );
    return await Promise.all(promises);
}

export const getHashMap = async <T>(forage: LocalForage): Promise<Record<string, T>> => {
    const keys = await forage.keys();
    const promises = keys.map(
        async (k): Promise<[string, T]> => {
            const value: T = (await forage.getItem<T>(k))!;
            return [k, value]
        }
    );
    return Object.fromEntries(await Promise.all(promises));
}

export interface QueryForageItem {

    id: string,

    name: string,
    lastEditTime: number,
    createTime: number,

    dataSourceId: DataSourceForageItem["id"];

    edges: EntityState<IPatternEdge>,
    nodes: EntityState<IPatternNode>,
    constraints: ConstraintsState,
    solutionCaches?: Solution.PatternSolution[],

    constraintContext?: Omit<IConstraintContext, "constraints">
}


export const getConstraintContextFromQueryForage = (file: QueryForageItem): IConstraintContext | undefined => {
    if (file.constraintContext)
        return Object.assign(file.constraintContext, {
            constraints: Object.values(file.constraints.entities) as IConstraint[]
        })
    return undefined;
}

export const getFileOverviews = async (database: IdeographDatabase) => {
    const allStoredQueries = await getAll<QueryForageItem>(database.query);
    const grouped = _.groupBy(allStoredQueries, q => q.dataSourceId);
    const dataSources = await getAll<DataSourceForageItem>(database.dataSource);
    return dataSources.map(
        dataSource => ({
            dataSource,
            queries: grouped[dataSource.id] ?? []
        })
    )
}

interface IConnectableDatabase {
    hostAddress: string,
    port: number,
}

interface MongoDbConnectable extends IConnectableDatabase {
    userName?: string,
    password?: string,
}

interface DGraphConnectable extends IConnectableDatabase { }

export interface DataSourceForageItem {
    id: string,
    mongo: MongoDbConnectable,
    name: string,
    dgraph?: DGraphConnectable,
}

export type PatternHistoryForageItem = SolvePatternResponse & {
    queryTimestamp: number,
}