import { MockAPIObject, TDummyDB } from "../../lib/mock-server";

// TODO: STRICTER TYPINGS
export const createNote: MockAPIObject<any, any> = {
    url: "/notes/create",
    method: "POST",
    responseCb: (reqData: any, db: TDummyDB): Promise<any> => {
        return db.insert("notes", reqData);
    },
};

export const updateNote: MockAPIObject<any, any> = {
    url: "/notes/update",
    method: "PUT",
    responseCb: (reqData: any, db: TDummyDB): Promise<any> => {
        return db.update("notes", reqData.params, reqData.body);
    },
};

export const getNote: MockAPIObject<any, any> = {
    url: "/notes",
    method: "GET",
    responseCb: (reqData: any, db: TDummyDB): Promise<any> => {
        return db.find("notes", reqData);
    },
};

export const deleteNote: MockAPIObject<any, any> = {
    url: "/notes/delete",
    method: "DELETE",
    responseCb: (reqData: any, db: TDummyDB): Promise<any> => {
        return db.remove("notes", reqData);
    },
};
