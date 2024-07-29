import React, { useEffect, useState } from "react";
import "./QuizReview.css";
import { Button } from "../../components/button/Button";
import deleteIcon from "../../assets/delete-icon.svg";
import editIcon from "../../assets/edit-icon.svg"; // TODO: absolute paths
import saveIcon from "../../assets/save-icon.svg";
import { experimental } from "../../theme/theme";
import { api } from "../../lib/api-client";
import { mockServer } from "../../lib/mock-server";
import { createQuizCard, deleteQuizCard, getQuizCard, updateQuizCard } from "./mocks";
import { Quiz } from "./models";
import { Spinner } from "../../components/spinner/Spinner";

type CardQuizProps = {
    question: string;
    answer: string;
    id: number;
    tags?: Array<string>;
    onSave: (id: number, question: string, answer: string) => void;
    onDelete: (id: number) => void;
};

const NEW_CARD_ID = -1;

function CardQuiz({
    question: questionProp,
    answer: answerProp,
    id,
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

    console.log("does card update?", question, questionProp);

    const [questionEditMode, setQuestionEditMode] = useState(false);
    const [answerEditMode, setAnswerEditMode] = useState(false);
    const save = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setQuestionEditMode(false);
        setAnswerEditMode(false);
        onSave(id, question, answer);
    };
    const edit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setQuestionEditMode(true);
        setAnswerEditMode(true);
    };
    const remove = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setQuestionEditMode(false);
        setAnswerEditMode(false);
        onDelete(id);
    };
    return (
        <div
            data-flipped={cardFlipped}
            onClick={() => setCardFlipped(!cardFlipped)}
            className="quiz-card h-full w-full top-0 left-0 group"
        >
            <div
                className={
                    "absolute top-5 -right-8 flex flex-col items-center " +
                    "opacity-0 group-hover:opacity-100 transition"
                }
            >
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
            <div className="quiz-card-inner absolute top-0 left-0 w-full h-full">
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
mockServer.registerMockObjects([getQuizCard, deleteQuizCard, createQuizCard, updateQuizCard]);
export function QuizReview() {
    const [rotateIdx, setRotateIdx] = useState(0); // 0 = NEXT, 1 = CURRENT, 2 = PREV

    const BATCH_SIZE = 5;
    const [quizzes, setQuizzes] = useState<Quiz[] | null>(null); // null=default, [] = empty;
    const [curIdx, setCurIdx] = useState(-1); // -1: nullish,
    // make sure all prev, current, and next is valid
    const validIdx = (idx: number) => quizzes && quizzes.length && idx >= 0 && idx < quizzes.length;
    const indisplay: Array<Quiz | null> = // 0 = next, 1 = cur, 2 = prev
        quizzes === null
            ? []
            : [1, 0, -1].map((v) => (validIdx(curIdx + v) ? quizzes[curIdx + v] : null));

    const [loading, setLoading] = useState(false);

    console.log(curIdx, quizzes, indisplay);
    useEffect(() => {
        // fetch if null, or next is the last one
        if (!quizzes || (curIdx + 1 >= quizzes.length && curIdx - 1 >= 0)) {
            console.log("Fetching new batch...");
            // loading if current is null
            if (!quizzes || curIdx >= quizzes.length) {
                setLoading(true);
            }
            let latest = true;
            api.mock(Math.random() * 4000 + 100)
                .get(getQuizCard.url, {})
                .then((data) => {
                    const d = data as Array<Quiz>;
                    if (latest) {
                        if (!quizzes) {
                            setQuizzes(d);
                            if (d.length) {
                                setCurIdx(0);
                            }
                        } else {
                            setQuizzes([...quizzes.slice(curIdx - 1), ...d]);
                            setCurIdx(1);
                        }
                        setLoading(false);
                    }
                })
                .catch((err) => console.error(err));
            return () => {
                latest = false;
            };
        }
    }, [curIdx]);

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

    function upsertCard(id: number, question: string, answer: string) {
        if (id === NEW_CARD_ID) {
            setLoading(true);
            api.mock(200)
                .post(createQuizCard.url, {
                    question: question,
                    answer: answer,
                })
                .then((d) => api.mock(100).get(getQuizCard.url, {}))
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
                    },
                })
                .then((d) => api.mock(100).get(getQuizCard.url, {}))
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
                .then(() => api.mock(100).get(getQuizCard.url, {}))
                .then((data) => {
                    setQuizzes(data as Array<Quiz>);
                    setCurIdx(0);
                    setLoading(false);
                })
                .catch((err) => console.error(err));
        }
    }
    return (
        <div className="max-w-2xl mx-auto h-full flex flex-col justify-center overflow-x-hidden">
            <div className="relative mx-auto h-64 w-[80%]">
                {!addingNewCard &&
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
                                        "absolute top-0 left-0 w-full h-full " +
                                        "data-[loc='2']:translate-x-[-100%] data-[loc='2']:rotate-[-20deg] data-[loc='2']:opacity-0 data-[loc='2']:invisible " +
                                        "data-[loc='0']:translate-x-[100%] data-[loc='0']:rotate-[20deg] data-[loc='0']:opacity-0 data-[loc='0']:invisible " +
                                        "transition ease-in-out duration-300"
                                    }
                                    style={{ zIndex: loc }}
                                >
                                    {indisplay[loc] !== null && (
                                        <CardQuiz
                                            key={Date.now()} // since we're "recycling" these 3 cards,
                                            // have to reset evtime
                                            id={indisplay[loc].id}
                                            question={indisplay[loc].question}
                                            answer={indisplay[loc].answer}
                                            onSave={upsertCard}
                                            onDelete={deleteCard}
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
                    <CardQuiz
                        id={NEW_CARD_ID}
                        question="Adding new question..."
                        answer="Adding new answer..."
                        onSave={upsertCard}
                        onDelete={deleteCard}
                    />
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
            <div className="mt-2 flex justify-center">
                <Button
                    className="mr-1"
                    disabled={addingNewCard || !validIdx(curIdx)}
                    onClick={nextCard}
                >
                    Next
                </Button>
                <Button onClick={toggleNewCard}>{addingNewCard ? "Cancel" : "New"}</Button>
            </div>
        </div>
    );
}
