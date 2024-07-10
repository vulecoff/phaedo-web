import { isMatch, method } from "lodash-es";
import { HTTPMethod } from "./api-client";

/**
 * Table
 *      row = obj, with its first-level keys as columns
 */
export interface TDummyDB {
    find: (table: string, query: Record<any, any>) => Promise<Array<any>>;
    /**
     * Insert object into table and create table if not exists
     * automatically create "_id" field
     * @param table
     * @param obj
     * @returns
     */
    insert: (table: string, obj: Record<any, any>) => Promise<any>;
    update: (table: string, query: Record<any, any>, obj: Record<any, any>) => Promise<Array<any>>;

    /**
     *
     * @param table
     * @param query
     * @returns return removed records
     */
    remove: (table: string, query: Record<any, any>) => Promise<any>;
}

// TODO: implement cursor when too many data. Refer to IndexedDB docs
class DummyDB implements TDummyDB {
    private db: IDBDatabase | null;
    DB_NAME = "phaedo";
    TABLES = ["notes"];

    constructor() {
        this.db = null;
    }

    /**
     * quick successive calls on startup may open new connections, but
     * multiple connections are allowed in indexedDB. Afterwards, the last connection
     * is reused
     * @returns
     */
    initialize(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.db !== null) {
                return resolve(this);
            }
            const openrequest = indexedDB.open(this.DB_NAME);
            console.info("initiating a new DB connection...");
            openrequest.onerror = function (e) {
                return reject(new Error(`Failed to initialize database: ${e}`));
            };

            openrequest.onupgradeneeded = (e) => {
                console.info("Creating tables for IndexedDB...");
                this.db = openrequest.result;
                for (const tableName of this.TABLES) {
                    this.db!.createObjectStore(tableName, {
                        keyPath: "id",
                        autoIncrement: true,
                    });
                }
            };
            openrequest.onsuccess = (e) => {
                console.info("DB connection opened successfully.");
                this.db = openrequest.result;
                resolve(this);
            };
        });
    }

    tableExists(table: string): boolean {
        return this.db!.objectStoreNames.contains(table);
    }

    find(table: string, query: Record<any, any>): Promise<Array<any>> {
        return new Promise((resolve, reject) => {
            if (!this.tableExists(table)) {
                return reject(new Error(`${table} does not exist.`));
            }
            const requestAllRows = this.db!.transaction(table).objectStore(table).getAll();
            requestAllRows.onsuccess = (e) => {
                const allRows = requestAllRows.result;

                query = query.id ? { id: parseInt(query.id) } : {}; // TODO: types for database indices, unclean code

                const filtered = allRows.filter((o) => isMatch(o, query));
                resolve(filtered);
            };

            requestAllRows.onerror = (e) => {
                reject(new Error(`Error querying from ${table}`));
            };
        });
    }
    insert(table: string, obj: Record<any, any>): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.tableExists(table)) {
                return reject(new Error(`Table ${table} does not exist`));
            }
            const writeRequest = this.db!.transaction(table, "readwrite")
                .objectStore(table)
                .add(obj);
            writeRequest.onsuccess = (e) => {
                resolve(writeRequest.result);
            };
            writeRequest.onerror = (e) => {
                reject(writeRequest.error);
            };
        });
    }

    // TODO: validate type for obj (cannot contains "id" field)
    update(table: string, query: Record<any, any>, obj: Record<any, any>): Promise<Array<any>> {
        return new Promise((resolve, reject) => {
            if (!this.tableExists(table)) {
                return reject(new Error(`Table ${table} does not exist`));
            }
            query = this.validateQuery(query);

            const storeTable = this.db!.transaction(table, "readwrite").objectStore(table);
            const readWriteRequest = storeTable.getAll(IDBKeyRange.only(query["id"]));
            const updatedKeys: any[] = [];
            readWriteRequest.onsuccess = (e) => {
                for (const res of readWriteRequest.result) {
                    Object.assign(res, obj);
                    const updateRequest = storeTable.put(res);
                    updateRequest.onsuccess = (e) => {
                        updatedKeys.push(updateRequest.result);
                    };
                    updateRequest.onerror = (e) => {
                        return reject(
                            new Error(
                                `Error while updating record of table ${table}: ${updateRequest.error}`
                            )
                        );
                    };
                    resolve(updatedKeys);
                }
            };
            readWriteRequest.onerror = (e) => {
                reject(
                    new Error(
                        `Error in querying during update of table ${table}: ${readWriteRequest.error}`
                    )
                );
            };
        });
    }
    remove(table: string, query: Record<any, any>): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.tableExists(table)) {
                return reject(new Error(`${table} does not exist.`));
            }
            query = this.validateQuery(query);

            const deleteRequest = this.db!.transaction(table, "readwrite")
                .objectStore(table)
                .delete(IDBKeyRange.only(query["id"]));
            deleteRequest.onsuccess = (e) => {
                resolve(deleteRequest.result);
            };
            deleteRequest.onerror = (e) => {
                reject(deleteRequest.error);
            };
        });
    }

    validateQuery(query: Record<any, any>): any {
        if (!query.hasOwnProperty("id")) {
            throw new Error(`Query is missing field "id"`);
        }
        if (Object.keys(query).length > 1) {
            throw new Error(`Query contains unsupported fields`);
        }
        const queryId = parseInt(query.id);
        if (!query.id) {
            throw new Error(`Cannot convert queryId to integer ${query.id}`);
        }
        return {
            id: queryId,
        };
    }
}

export type MockAPIObject<TRequestData, TResponseData> = {
    url: string;
    method: HTTPMethod;
    /**
     * directly returns object or persist in local database
     * @param reqData
     * @param db
     * @returns
     */
    responseCb: (reqData: TRequestData, db: TDummyDB) => Promise<TResponseData>;
};
/**
 * with handler: route & method --> callback {either persist into local db, or return immediately data}
 * also loadDefaults data
 */
export const mockServer = {
    db: new DummyDB(),
    mockObjects: new Array<MockAPIObject<any, any>>(),

    registerMockObject: function (obj: MockAPIObject<any, any>) {
        if (this.findResource(obj.url, obj.method)) {
            throw new Error(
                `MOCK SERVER: Resource already exists for URL ${obj.url} and METHOD: ${method}`
            );
        }
        this.mockObjects.push(obj);
    },
    registerMockObjects: function (objs: Array<MockAPIObject<any, any>>) {
        for (const obj of objs) {
            this.registerMockObject(obj);
        }
    },

    findResource: function (url: string, method: HTTPMethod) {
        return this.mockObjects.find((o) => o.method === method && o.url === url);
    },
    handler: async function (url: string, method: HTTPMethod, reqData?: any): Promise<any> {
        // lazy db initialization
        await this.db.initialize();
        console.info(
            `MOCK SERVER: handling URL ${url} METHOD ${method}.\n DATA: ${JSON.stringify(reqData)}`
        );
        const mockObj = this.findResource(url, method);
        if (!mockObj) {
            return Promise.reject(`Resource doesn't exist for URL ${url} and METHOD: ${method}`);
        }
        return mockObj.responseCb(reqData, this.db);
    },
};
