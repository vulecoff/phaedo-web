import { sample } from "lodash-es";
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

// QUIZ REVIEW
export const createQuizCard: MockAPIObject<any, any> = {
    url: "/quiz/create",
    method: "POST",
    responseCb: (reqData: any, db: TDummyDB): Promise<any> => {
        return db.insert("quiz", reqData);
    },
};
export const getQuizCard: MockAPIObject<any, any> = {
    url: "/quiz",
    method: "GET",
    responseCb: (reqData: any, db: TDummyDB): Promise<any> => {
        return db.find("quiz", reqData).then((all) => {
            if (!all.length) {
                return [];
            }
            const BATCH_SIZE = 5;
            const randomBatch = [];
            for (let i = 0; i < BATCH_SIZE; i++) {
                randomBatch.push(sample(all));
            }
            return randomBatch;
        });
    },
};
export const deleteQuizCard: MockAPIObject<any, any> = {
    url: "/quiz/delete",
    method: "DELETE",
    responseCb: (reqData: any, db: TDummyDB): Promise<any> => {
        return db.remove("quiz", reqData);
    },
};

export const updateQuizCard: MockAPIObject<any, any> = {
    url: "/quiz/update",
    method: "PUT",
    responseCb: (reqData: any, db: TDummyDB): Promise<any> => {
        return db.update("quiz", reqData.params, reqData.body);
    },
};
