import { MockAPIObject, TDummyDB } from "../../lib/mock-server";
import { Tag } from "./tagModel";

export const getTags: MockAPIObject<any, any> = {
    url: "/tags",
    method: "GET",
    responseCb: (reqData: any, db: TDummyDB): Promise<any> => {
        return db.find("tags", reqData);
    },
};

export const createTag: MockAPIObject<any, any> = {
    url: "/tags/create",
    method: "POST",
    responseCb: (reqData: any, db: TDummyDB) => {
        return db.insert("tags", { label: reqData.value, value: reqData.value });
    },
};

export const deleteTag: MockAPIObject<any, any> = {
    url: "/tags/delete",
    method: "DELETE",
    responseCb: (reqData: any, db: TDummyDB): Promise<any> => {
        return db.remove("tags", reqData);
    },
};
