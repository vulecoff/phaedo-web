import { useEffect, useState } from "react";
import { RichTextEditor } from "../../components/editor/RichTextEditor";
import { Button } from "../../components/button/Button";
import { api } from "../../lib/api-client";
import { mockServer } from "../../lib/mock-server";
import { createNote, deleteNote, getNote, updateNote } from "./mocks";
import { useNavigate, useParams } from "react-router-dom";

// TODO HOW TO SHARE BETWEEN A BUNCH OF COMPONENTS
mockServer.registerMockObjects([createNote, deleteNote, updateNote]);

export function CreateOrEditNote() {
    const [title, setTitle] = useState("Untitled");
    const { id } = useParams();

    // TODO: add type, standardize with setState signatures' callback fn
    // Store reference export function
    const [exportHtmlFn, setExportHtmlFn] = useState(() => () => {});

    const [htmlContent, setHtmlContent] = useState(""); // 1-way
    const [saveLoading, setSaveLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const disableButtons = saveLoading || deleteLoading;

    const navigate = useNavigate();

    useEffect(() => {
        // set loading shell
        if (id) {
            api.mock(100)
                .get(getNote.url, {
                    id: id,
                })
                .then((res) => {
                    if (res.length == 0) {
                        return navigate("/notes/create"); // TODO: handle 404
                    }
                    setTitle(res[0].title);
                    setHtmlContent(res[0].contentHtml);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [id]);

    useEffect(() => {
        function handleCtrlS(event: KeyboardEvent) {
            if (event.ctrlKey && event.key === "s") {
                event.preventDefault();
                console.log("Saving...");
                save();
            }
        }
        window.addEventListener("keydown", handleCtrlS);
        return () => {
            window.removeEventListener("keydown", handleCtrlS);
        };
    }, [save]);

    // TODO: convert to useCallback()
    function save() {
        setSaveLoading(true);
        if (!id) {
            api.mock(500)
                .post(createNote.url, {
                    title: title,
                    contentHtml: exportHtmlFn(),
                    dateUpdated: new Date(),
                })
                .then((res) => {
                    // res is id
                    setSaveLoading(false);
                    console.log("create response: ", res);
                    return navigate(`/notes/${res}/edit`);
                })
                .catch((err) => console.log(err));
        } else {
            api.mock(500)
                .put(updateNote.url, {
                    params: { id: id },
                    body: { title: title, contentHtml: exportHtmlFn(), dateUpdated: new Date() },
                })
                .then((res) => {
                    setSaveLoading(false);
                })
                .catch((err) => console.log(err));
        }
    }
    function handleSave(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();
        if (!exportHtmlFn) {
            return;
        }
        save();
    }

    function handleDelete(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();
        setDeleteLoading(true);
        api.mock(300)
            .delete(deleteNote.url, { id: id })
            .then((res) => {
                console.log("Finished deleting...", res);
                setDeleteLoading(false);
                return navigate("/notes");
            })
            .catch((err) => {
                console.log(err);
            });
    }

    return (
        <div className="container relative p-3 h-full flex flex-col">
            <div className="flex justify-between border-b border-gray-100 pb-2 mb-2">
                <input
                    type="text"
                    placeholder="Untitled"
                    className="placeholder-gray-400 font-semibold"
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value);
                    }}
                />
                <div className="space-x-1">
                    <Button
                        onClick={handleSave}
                        disabled={exportHtmlFn === null || disableButtons}
                        loading={saveLoading}
                        tabIndex={-1}
                        variant="outline-primary"
                    >
                        Save
                    </Button>
                    <Button
                        variant="red"
                        disabled={disableButtons}
                        loading={deleteLoading}
                        onClick={handleDelete}
                        tabIndex={-1}
                    >
                        Delete
                    </Button>
                </div>
            </div>

            <RichTextEditor
                placeholder="Add some note to review..."
                classNames="min-h-12"
                placeholderWeight="bold"
                autofocus
                content={htmlContent}
                onExportFnChange={setExportHtmlFn}
            />
        </div>
    );
}
