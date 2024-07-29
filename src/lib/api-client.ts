import { mockServer } from "./mock-server";

export type RequestData = {
    params?: Record<any, any>;
    body?: Record<any, any>;
};

export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";

export class ApiClient {
    private baseUrl: string;
    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    get<TResponseBody>(url: string): Promise<TResponseBody> {
        url = this.baseUrl + "url";
        const request = new Request(url, {
            headers: {
                "content-type": "application/json",
                accept: "application/json",
            },
        });
        return fetch(request)
            .then((res) => {
                if (!res.ok) {
                    const err = {
                        url: url,
                        status: res.status,
                        statusText: res.statusText,
                    };
                    return Promise.reject(err);
                }
                return res.json() as TResponseBody;
            })
            .catch((err) => {
                this.logError(url, "get", err);
                return err;
            });
    }

    post<TResponseBody>(url: string, body: Record<any, any>): Promise<TResponseBody> {
        url = this.baseUrl + url;
        const request = new Request(url, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                accept: "application/json",
            },
            body: JSON.stringify(body),
        });
        return fetch(request)
            .then((res) => {
                if (!res.ok) {
                    const err = {
                        url: url,
                        status: res.status,
                        statusText: res.statusText,
                    };
                    return Promise.reject(err);
                }
                return res.json() as TResponseBody;
            })
            .catch((err) => {
                this.logError(url, "post", err);
                return err;
            });
    }

    // getWithParams<TResponse>(url: string): Promise<TResponse> {}

    private logError(url: string, method: string, error: Error) {
        console.log(`Error occured at ${url}, method ${method}.\n Error: ${error}`);
    }

    // TODO: mock statuses & error +  stricter types here
    mock(timeout: number = 10) {
        return {
            get: async function (url: string, reqData: Record<any, any>): Promise<any> {
                const res = await mockServer.handler(url, "GET", reqData);
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(res);
                    }, timeout);
                });
            },
            post: async function (url: string, reqData: Record<any, any>): Promise<any> {
                const res = await mockServer.handler(url, "POST", reqData);
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(res);
                    }, timeout);
                });
            },
            delete: async function (url: string, reqData: Record<any, any>): Promise<any> {
                const res = await mockServer.handler(url, "DELETE", reqData);
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(res);
                    }, timeout);
                });
            },
            put: async function (url: string, reqData: Record<any, any>): Promise<any> {
                const res = await mockServer.handler(url, "PUT", reqData);
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(res);
                    }, timeout);
                });
            },
        };
    }
}

export const api = new ApiClient("");
