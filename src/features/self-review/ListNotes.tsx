import { useEffect, useState } from "react";
import { api } from "../../lib/api-client";
import { mockServer } from "../../lib/mock-server";
import { getNote } from "./mocks";
import { Link } from "react-router-dom";
import addIcon from "../../../src/assets/add-icon.svg";
import { SpinnerSquare } from "../../components/spinner/SpinnerSquare";

mockServer.registerMockObjects([getNote]);

function NoteItem(props: { id: string; title: string }) {
    const { title, id } = props;
    const styles = [
        "flex flex-row justify-between items-center gap-4",
        "p-3",
        "border-b-2 border-black",
        "cursor-pointer",
        "hover:translate-x-1 hover:shadow",
        "transition-all",
    ];
    return (
        <>
            <Link to={"/notes/" + id + "/edit"} className={styles.join(" ")}>
                <span className="truncate font-semibold">{title}</span>
                <span className="text-sm italic">{new Date().toDateString()}</span>
            </Link>
        </>
    );
}

export function ListNotes() {
    const [notes, setNotes] = useState<Array<any> | null>(null);
    const [loadingNotes, setLoadingNotes] = useState(false);
    useEffect(() => {
        setLoadingNotes(true);
        api.mock(300)
            .get(getNote.url, {})
            .then((data) => {
                data = data as Array<any>;
                console.log(data);
                data.sort((a: any, b: any) => {
                    return new Date(b.dateUpdated).getTime() - new Date(a.dateUpdated).getTime();
                });
                setNotes(data);
                setLoadingNotes(false);
            })
            .catch((err) => console.log(err));
    }, []);
    const styles = ["p-4 min-h-full max-w-2xl mx-auto", "flex flex-col"];
    return (
        <>
            <div className={styles.join(" ")}>
                {loadingNotes ? (
                    <SpinnerSquare className="size-8 mx-auto my-auto" />
                ) : (
                    <>
                        <Link to="/notes/create">
                            <div className="border border-black border-2 border-dashed p-2 flex justify-center mb-4">
                                <img src={addIcon} className="size-7" />
                            </div>
                        </Link>
                        <div>
                            {notes &&
                                notes.length > 0 &&
                                notes.map((noteItem) => (
                                    <NoteItem
                                        key={noteItem.id}
                                        id={noteItem.id}
                                        title={noteItem.title}
                                    />
                                ))}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
