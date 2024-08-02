import React, { ChangeEvent, useEffect, useState } from "react";
import "./QuizReview.css";
import { Button } from "../../components/button/Button";
import deleteIcon from "../../assets/delete-icon.svg";
import editIcon from "../../assets/edit-icon.svg"; // TODO: absolute paths
import saveIcon from "../../assets/save-icon.svg";
import tagsIcon from "../../assets/tags-icon.svg";
import { experimental } from "../../theme/theme";
import { api } from "../../lib/api-client";
import { mockServer } from "../../lib/mock-server";
import {
    createQuizCard,
    deleteQuizCard,
    getQuizCards,
    getRandomQuizCards,
    updateQuizCard,
} from "./mocks";
import { Quiz } from "./models";
import { Spinner } from "../../components/spinner/Spinner";
import { Switch } from "../../components/switch/Switch";
import { Tag } from "../shared/tagModel";
import {
    InputSelect,
    SelectOption,
    ValueChangeMeta,
} from "../../components/input-select/InputSelect";
import { createTag, getTags } from "../shared/tagMocks";

type CardQuizProps = {
    question: string;
    answer: string;
    id: number;
    tags?: Array<Tag>;
    allTags: Array<Tag>;
    onNewTagCreated: (tagValue: string) => void;
    onSave: (id: number, question: string, answer: string, tags: Array<number>) => void;
    onDelete: (id: number) => void;
};

const NEW_CARD_ID = -1;

function CardQuiz({
    question: questionProp,
    answer: answerProp,
    id,
    onNewTagCreated,
    tags: tagsProp = [],
    allTags,
    onSave,
    onDelete,
}: CardQuizProps) {
    const [cardFlipped, setCardFlipped] = useState(false);
    const cardStyles = [
        "flex flex-col justify-center items-center",
        "bg-white border-1 rounded-md shadow-md",
        "absolute top-0 left-0 w-full h-full p-2",
    ].join(" ");

    const cardContentStyles = [
        "max-h-full max-w-full p-1 overflow-y-auto whitespace-pre-wrap",
        "data-[editable=true]:w-full data-[editable=true]:h-full data-[editable=true]:cursor-text",
        experimental.colors.zen30.outline,
        // "data-[editable=true]:outline-none",
    ].join(" ");

    const [question, setQuestion] = useState(questionProp);
    const [answer, setAnswer] = useState(answerProp);

    const allOpts: SelectOption[] = allTags.map((t) => ({ label: t.label, value: t.value }));
    const [selectOpts, setSelectOpts] = useState<SelectOption[]>([]);

    function onSelectOptsChange(newValue: SelectOption[], meta: ValueChangeMeta) {
        setSelectOpts(newValue);
    }

    const isCreatingNewCard = NEW_CARD_ID === id;
    const [questionEditMode, setQuestionEditMode] = useState(isCreatingNewCard);
    const [answerEditMode, setAnswerEditMode] = useState(isCreatingNewCard);
    const [tagsEditMode, setTagsEditMode] = useState(isCreatingNewCard);

    const save = (e: React.MouseEvent<HTMLButtonElement>) => {
        setQuestionEditMode(false);
        setAnswerEditMode(false);
        setTagsEditMode(false);
        onSave(
            id,
            question,
            answer,
            allTags
                .filter((t) => selectOpts.findIndex((so) => so.value === t.value) > -1)
                .map((t) => t.id)
        );
    };
    const edit = (e: React.MouseEvent<HTMLButtonElement>) => {
        setQuestionEditMode(true);
        setAnswerEditMode(true);
        setTagsEditMode(true);
    };
    const remove = (e: React.MouseEvent<HTMLButtonElement>) => {
        setQuestionEditMode(false);
        setAnswerEditMode(false);
        setTagsEditMode(false);
        onDelete(id);
    };
    return (
        <div
            data-flipped={cardFlipped}
            className="quiz-card relative h-full w-full top-0 left-0 group"
        >
            <div
                className={
                    "absolute bottom-full mb-1 flex flex-row items-center w-full max-h-12 " +
                    "z-30 opacity-0 group-hover:opacity-100 transition"
                }
            >
                <div className="flex-1 flex flex-row flex-wrap">
                    <span className="mr-1">
                        <img src={tagsIcon} className="size-4" />
                    </span>
                    {tagsEditMode ? (
                        <InputSelect
                            options={allOpts}
                            allowNewOptionsCreated
                            onChange={onSelectOptsChange}
                            value={selectOpts}
                            onNewOptionsCreated={onNewTagCreated}
                        />
                    ) : (
                        tagsProp.map((t) => (
                            <span key={t.id} className="text-sm">
                                {t.label},{" "}
                            </span>
                        ))
                    )}
                </div>
                <div className="flex-shrink-0 flex items-end">
                    <button className="hover:bg-white" title="Save" onClick={save}>
                        <img src={saveIcon} className="size-5" />
                    </button>
                    {/* TODO: icon sizing consistency?? */}
                    <button className="hover:bg-white" title="Edit" onClick={edit}>
                        <img src={editIcon} className="size-6 mt-1" />
                    </button>
                    <button className="hover:bg-white" title="Delete" onClick={remove}>
                        <img src={deleteIcon} className="size-5 mt-1" />
                    </button>
                </div>
            </div>

            <div
                className="quiz-card-inner absolute top-0 left-0 w-full h-full"
                onClick={() => setCardFlipped(!cardFlipped)}
            >
                <div className={"front " + cardStyles}>
                    <div // TODO: rich text, innerHtml instead of innerText
                        className={cardContentStyles}
                        onClick={(e) => {
                            if (questionEditMode) {
                                e.stopPropagation();
                            }
                        }}
                        contentEditable={questionEditMode}
                        data-editable={questionEditMode}
                        onBlur={(e) => {
                            setQuestion(e.target.innerText ?? "");
                            setQuestionEditMode(false);
                        }}
                        dangerouslySetInnerHTML={{ __html: question }}
                    ></div>
                </div>
                <div className={"back " + cardStyles}>
                    <div // TODO: rich text
                        className={cardContentStyles}
                        onClick={(e) => {
                            if (answerEditMode) {
                                e.stopPropagation();
                            }
                        }}
                        contentEditable={answerEditMode}
                        data-editable={answerEditMode}
                        onBlur={(e) => {
                            setAnswer(e.target.innerText ?? "");
                            setAnswerEditMode(false);
                        }}
                        dangerouslySetInnerHTML={{ __html: answer }}
                    ></div>
                </div>
            </div>
        </div>
    );
}

// Quiz review container
mockServer.registerMockObjects([
    getQuizCards,
    getRandomQuizCards,
    deleteQuizCard,
    createQuizCard,
    updateQuizCard,
    createTag,
]);
export function QuizReview() {
    const [rotateIdx, setRotateIdx] = useState(0); // 0 = NEXT, 1 = CURRENT, 2 = PREV

    enum Mode {
        RANDOM,
        NORMAL,
    }
    const [mode, setMode] = useState(Mode.NORMAL);
    const apiUrlOnMode = mode === Mode.NORMAL ? getQuizCards.url : getRandomQuizCards.url;

    const BATCH_SIZE = 5;
    const [quizzes, setQuizzes] = useState<Quiz[] | null>(null); // null=default, [] = empty;
    const [curIdx, setCurIdx] = useState(-1); // -1: nullish,
    // make sure all prev, current, and next is valid
    const validIdx = (idx: number) => quizzes && quizzes.length && idx >= 0 && idx < quizzes.length;
    const indisplay: Array<Quiz | null> = // 0 = next, 1 = cur, 2 = prev
        quizzes === null
            ? []
            : [1, 0, -1].map((v) => (validIdx(curIdx + v) ? quizzes[curIdx + v] : null));

    const [allTags, setAllTags] = useState<Array<Tag>>([]);
    const [tagsFilter, setTagsFilter] = useState<Array<SelectOption>>([]);
    const tagsFilterValue = tagsFilter.map((opt) => opt.value);

    const [loading, setLoading] = useState(false);

    console.log("Showing all and current displays: ", curIdx, quizzes, indisplay);

    // TODO: abstract out api call into hooks
    useEffect(() => {
        // fetch if null, or next is the last one
        if (!quizzes || (curIdx + 1 >= quizzes.length && curIdx >= 0)) {
            console.info("Fetching new batch...");
            // loading if current is null
            if (!quizzes || curIdx >= quizzes.length) {
                setLoading(true);
            }
            let latest = true;
            api.mock(Math.random() * 3000 + 100)
                .get(apiUrlOnMode, {
                    tagsFilter: tagsFilterValue,
                })
                .then((data) => {
                    const d = data as Array<Quiz>;
                    if (latest) {
                        if (!quizzes) {
                            setQuizzes(d);
                            if (d.length) {
                                setCurIdx(0);
                            }
                        } else {
                            setQuizzes([...quizzes.slice(curIdx), ...d]);
                            setCurIdx(0);
                        }
                        setLoading(false);
                    }
                })
                .catch((err) => console.error(err));
            return () => {
                latest = false;
            };
        }
    }, [curIdx, mode, tagsFilter]);

    useEffect(() => {
        api.mock(100)
            .get(getTags.url, {})
            .then((t) => {
                setAllTags(t);
            })
            .catch((err) => console.error(err));
    }, []);

    function onTagsFilterChange(n: SelectOption[], meta: ValueChangeMeta) {
        setTagsFilter(n);
        setQuizzes(null);
    }

    function changeMode(e: ChangeEvent<HTMLInputElement>) {
        setMode(e.target.checked ? Mode.RANDOM : Mode.NORMAL);
        setQuizzes(null);
    }

    function onNewTagCreated(createdTagValue: string) {
        api.mock(100)
            .post(createTag.url, { value: createdTagValue })
            .then((t) => {
                return api.mock(200).get(getTags.url, {});
            })
            .then((tags) => {
                setAllTags(tags);
            })
            .catch((err) => console.error(err));
    }

    function nextCard() {
        if (!quizzes || !quizzes.length || curIdx >= quizzes.length) {
            return;
        }

        setRotateIdx((rotateIdx + 1) % 3);
        setCurIdx((prevIdx) => {
            if (prevIdx < quizzes.length) {
                return prevIdx + 1;
            }
            return prevIdx;
        });
    }

    const [addingNewCard, setAddingNewCard] = useState(false);
    function toggleNewCard() {
        setAddingNewCard((prev) => !prev);
    }

    function upsertCard(id: number, question: string, answer: string, tags: Array<number>) {
        if (id === NEW_CARD_ID) {
            setLoading(true);
            api.mock(200)
                .post(createQuizCard.url, {
                    question: question,
                    answer: answer,
                    tags: tags,
                })
                .then((d) =>
                    api.mock(100).get(apiUrlOnMode, {
                        tagsFilter: tagsFilterValue,
                    })
                )
                .then((data) => {
                    setQuizzes(data as Array<Quiz>);
                    setCurIdx(0);
                    setLoading(false);
                    setAddingNewCard(false);
                })
                .catch((err) => console.error(err));
        } else {
            setLoading(true);
            api.mock(200)
                .put(updateQuizCard.url, {
                    params: {
                        id: id,
                    },
                    body: {
                        question: question,
                        answer: answer,
                        tags: tags,
                    },
                })
                .then((d) =>
                    api.mock(100).get(apiUrlOnMode, {
                        tagsFilter: tagsFilterValue,
                    })
                )
                .then((data) => {
                    setQuizzes(data as Array<Quiz>);
                    setCurIdx(0);
                    setLoading(false);
                })
                .catch((err) => console.error(err));
        }
    }
    function deleteCard(id: number) {
        if (id !== NEW_CARD_ID) {
            setLoading(true);
            api.mock(200)
                .delete(deleteQuizCard.url, { id: id })
                .then(() =>
                    api.mock(100).get(apiUrlOnMode, {
                        tagsFilter: tagsFilterValue,
                    })
                )
                .then((data) => {
                    setQuizzes(data as Array<Quiz>);
                    setCurIdx(0);
                    setLoading(false);
                })
                .catch((err) => console.error(err));
        }
    }

    const [practiceText, setPracticeText] = useState(false);

    return (
        <div className="max-w-2xl mx-auto min-h-full flex flex-col justify-center overflow-hidden">
            <div className="relative mx-auto h-64 w-[90%]">
                {!addingNewCard && // TODO: this unmounts, is this the wise thing to do?
                    quizzes &&
                    (quizzes.length === 0 ? (
                        <div className="text-center absolute w-full top-[45%]">
                            There is nothing to review.
                        </div>
                    ) : (
                        [(rotateIdx + 0) % 3, (rotateIdx + 1) % 3, (rotateIdx + 2) % 3].map(
                            (loc, idx) => (
                                // 0 = next, 1 = current, 2 = prev
                                <div
                                    key={idx}
                                    data-loc={loc}
                                    className={
                                        // TODO: ordering of transition-property
                                        [
                                            "absolute top-0 left-0 w-full h-full",
                                            "data-[loc='2']:translate-x-[-100%] data-[loc='2']:rotate-[-20deg] data-[loc='2']:opacity-0 data-[loc='2']:invisible",
                                            "data-[loc='0']:translate-x-[100%] data-[loc='0']:rotate-[20deg] data-[loc='0']:opacity-0 data-[loc='0']:invisible",
                                            "transition ease-in-out duration-300",
                                        ].join(" ")
                                    }
                                    style={{ zIndex: loc }}
                                >
                                    {indisplay[loc] !== null && (
                                        <CardQuiz
                                            key={`${loc}`} // Reset as soon as it gets "moved".
                                            // Identity of an UI-CardQuiz is its location
                                            id={indisplay[loc].id}
                                            question={indisplay[loc].question}
                                            answer={indisplay[loc].answer}
                                            tags={indisplay[loc].tags}
                                            allTags={allTags}
                                            onSave={upsertCard}
                                            onDelete={deleteCard}
                                            onNewTagCreated={onNewTagCreated}
                                        />
                                    )}
                                </div>
                            )
                        )
                    ))}

                <div // NEW CARD
                    data-show={addingNewCard}
                    className={
                        "absolute top-0 left-0 w-full h-full transition z-20 " +
                        "data-[show=false]:-translate-y-5 data-[show=false]:invisible"
                    }
                >
                    {addingNewCard && ( // unmount & reset state
                        <CardQuiz
                            id={NEW_CARD_ID}
                            question="Adding new question..."
                            answer="Adding new answer..."
                            onSave={upsertCard}
                            onDelete={deleteCard}
                            allTags={allTags}
                            onNewTagCreated={onNewTagCreated}
                        />
                    )}
                </div>

                {loading && ( // LOADING SPINNER
                    <div
                        className={
                            "absolute top-0 left-0 w-full h-full flex justify-center items-center z-30 " +
                            "opacity-70 bg-gray-300"
                        }
                    >
                        <Spinner size="lg" variant="secondary" />
                    </div>
                )}
            </div>

            {
                // PROGRESS BAR
                quizzes && quizzes.length && validIdx(curIdx) && (
                    <div className="mt-1 mx-auto text-sm w-[90%]">
                        Progress: {curIdx + 1} / {quizzes?.length}
                    </div>
                )
            }

            {/* Action BAR */}
            <div className="mt-2 flex justify-center">
                <div className="mr-3">
                    <InputSelect
                        options={allTags}
                        value={tagsFilter}
                        onChange={onTagsFilterChange}
                    />
                </div>
                <div className="mr-4 flex flex-row items-center">
                    <Switch checked={mode === Mode.RANDOM} onChange={changeMode} />
                    <label className="ml-1">Random</label>
                </div>
                <Button
                    className="mr-1"
                    disabled={addingNewCard || !validIdx(curIdx)}
                    onClick={nextCard}
                >
                    Next
                </Button>
                <Button onClick={toggleNewCard}>{addingNewCard ? "Cancel" : "New"}</Button>
                <Button className="ml-1" onClick={() => setPracticeText(!practiceText)}>
                    Practice
                </Button>
            </div>

            {practiceText && ( // TODO: autosize textarea
                <div className="mt-5 w-[80%] mt-4 mx-auto h-72 border bg-white shadow-lg z-40">
                    <textarea className="w-full h-full p-1"></textarea>
                </div>
            )}
        </div>
    );
}
