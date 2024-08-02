import { Tag } from "../shared/tagModel";

// typings models
export type Quiz = {
    id: number;
    question: string;
    answer: string;
    tags: Array<Tag>;
};
