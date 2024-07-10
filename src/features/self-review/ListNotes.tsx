import { useEffect, useState } from "react";
import { api } from "../../lib/api-client";
import { mockServer } from "../../lib/mock-server";
import { getNote } from "./mocks";
import { Link } from "react-router-dom";
import addIcon from "../../../src/assets/add-icon.svg";

mockServer.registerMockObjects([getNote]);

function NoteItem(props: { id: string; title: string }) {
    const { title, id } = props;
    const styles = [
        "flex flex-row justify-between items-center gap-4",
        "p-3",
        "border-2 border-t-0 first:border-t-2 border-black",
        "cursor-pointer",
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
                console.log(data);
                setNotes(data as Array<any>);
                setLoadingNotes(false);
            })
            .catch((err) => console.log(err));
    }, []);
    const styles = ["p-4 min-h-full max-w-2xl mx-auto", "flex flex-col"];
    return (
        <>
            <div className={styles.join(" ")}>
                {loadingNotes ? (
                    <div>Shell</div>
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
