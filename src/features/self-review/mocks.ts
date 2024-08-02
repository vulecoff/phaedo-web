import { differenceWith, every, intersection, sample, sampleSize } from "lodash-es";
import { MockAPIObject, TDummyDB } from "../../lib/mock-server";
import { Quiz } from "./models";
import { Tag } from "../shared/tagModel";

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

const cleanQuizEntry = function (quiz: any, allTags: Array<Tag>, db: TDummyDB) {
    const inconsitencies = differenceWith(quiz.tags, allTags, (a, b) => a === b.id);
    if (inconsitencies.length) {
        const err = new Error(
            `Inconsistencies: Quiz has tags that is not in database. \n 
            Quiz: ${JSON.stringify(quiz)}. \n
            DiffTags: ${JSON.stringify(inconsitencies)}`
        );
        console.error(err);
        console.warn("Attempting to clean data asynchronously... Please reload after operation.");
        db.update(
            "quiz",
            { id: quiz.id },
            {
                ...quiz,
                tags: quiz.tags.filter((t: number) => !inconsitencies.includes(t)),
            }
        );
        throw err;
    }
};
export const getQuizCards: MockAPIObject<any, any> = {
    url: "/quiz/",
    method: "GET",
    responseCb: (reqData, db: TDummyDB): Promise<Array<Quiz>> => {
        return Promise.all([db.find("quiz", reqData), db.find("tags", {})]).then(
            ([quizzes, tags]) => {
                return quizzes
                    .map((q) => {
                        const allTags = tags as Array<Tag>;
                        cleanQuizEntry(q, allTags, db);
                        q.tags = q.tags.map((id: number) => allTags.find((t) => t.id === id));
                        return q;
                    })
                    .filter((q: Quiz) => {
                        const tagsFilter = reqData.tagsFilter as Array<string>;
                        if (!tagsFilter || !tagsFilter.length) {
                            return true;
                        }

                        const intersects = intersection(
                            q.tags.map((t) => t.value),
                            tagsFilter
                        );
                        return intersects.length > 0 && intersects.length === tagsFilter.length;
                    });
            }
        );
    },
};
export const getRandomQuizCards: MockAPIObject<any, any> = {
    url: "/quiz/random",
    method: "GET",
    responseCb: (reqData: any, db: TDummyDB): Promise<any> => {
        return Promise.all([db.find("quiz", reqData), db.find("tags", {})]).then(
            ([quizzes, tags]) => {
                const joinedQuizTag = quizzes
                    .map((q) => {
                        const allTags = tags as Array<Tag>;
                        cleanQuizEntry(q, allTags, db);
                        q.tags = q.tags.map((id: number) => allTags.find((t) => t.id === id));
                        return q;
                    })
                    .filter((q: Quiz) => {
                        const tagsFilter = reqData.tagsFilter as Array<string>;
                        if (!tagsFilter || !tagsFilter.length) {
                            return true;
                        }
                        const intersects = intersection(
                            q.tags.map((t) => t.value),
                            tagsFilter
                        );
                        return intersects.length > 0 && intersects.length === tagsFilter.length;
                    });

                if (!joinedQuizTag.length) {
                    return [];
                }
                const BATCH_SIZE = 5;
                return sampleSize(joinedQuizTag, BATCH_SIZE);
            }
        );
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
