import { Editor, EditorContent, useEditor } from "@tiptap/react";
import { Document } from "@tiptap/extension-document";
import { Bold } from "@tiptap/extension-bold";
import { Text } from "@tiptap/extension-text";
import { Paragraph } from "@tiptap/extension-paragraph";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import { useEffect } from "react";
import History from "@tiptap/extension-history";
import boldIcon from "../../assets/bold-icon.svg";
import italicIcon from "../../assets/italic-icon.svg";
import underlineIcon from "../../assets/underline-icon.svg";
import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Highlight from "@tiptap/extension-highlight";

export type EditorProps = {
    placeholder?: string;
    classNames?: string;
    autofocus?: boolean;
    placeholderWeight?: "default" | "light" | "bold";
    content?: string;
    onExportFnChange?: (val: any) => any; // needed to export html on-demand
};

const placeholderWeightMappings = {
    default: "before:text-gray-400 before:font-normal",
    light: "before:text-gray-300 before:font-light",
    bold: "before:text-gray-500 before:font-semibold",
};

/**
 * Configure TipTap Editor with essential extensions + placeholder styles
 * TODO: what classnames are allowed to add to avoid conflicts
 * https://github.com/dcastil/tailwind-merge/blob/v2.3.0/docs/when-and-how-to-use-it.md
 * @param props
 * @returns
 */
export function RichTextEditor(props: EditorProps) {
    const {
        placeholder,
        classNames = "",
        autofocus,
        placeholderWeight,
        content,
        onExportFnChange,
    } = props;
    const tiptapExtensions = [
        Document,
        Text,
        Bold,
        Italic,
        Underline,
        Paragraph,
        History,
        ListItem,
        BulletList.configure({
            HTMLAttributes: {
                class: "list-disc ps-5",
            },
        }),
        OrderedList.configure({
            HTMLAttributes: {
                class: "list-decimal ps-5",
            },
        }),
        Highlight,
    ];
    const baseStyles = [
        "before:content-[attr(data-placeholder)] before:pointer-events-none",
        "before:absolute before:top-0 before:left-0",
        placeholderWeight
            ? placeholderWeightMappings[placeholderWeight]
            : placeholderWeightMappings["default"],
        "focus:outline-none",
    ];

    const tiptapProps = {
        attributes: {
            class: [classNames, ...baseStyles].filter((x) => Boolean(x)).join(" "),
            ...(placeholder && { "data-placeholder": placeholder }),
            ...(autofocus && { autofocus: "true" }),
        },
    };
    const tiptapPropsHidePlaceholder = Object.assign({}, tiptapProps); // hide placeholder style
    tiptapPropsHidePlaceholder.attributes = Object.assign({}, tiptapProps.attributes);
    tiptapPropsHidePlaceholder.attributes.class += " before:hidden";
    const tiptapEditor = useEditor(
        {
            extensions: tiptapExtensions,
            editorProps: tiptapProps,
            onUpdate: ({ editor }) => {
                if (!editor.isEmpty) {
                    editor.setOptions({ editorProps: tiptapPropsHidePlaceholder });
                } else {
                    editor.setOptions({ editorProps: tiptapProps });
                }
            },
            content: content,
            onCreate: ({ editor }) => {
                if (onExportFnChange) {
                    onExportFnChange(() => () => editor.getHTML());
                }
                if (!editor.isEmpty) {
                    editor.setOptions({ editorProps: tiptapPropsHidePlaceholder });
                }
            },
            onDestroy: () => {
                if (onExportFnChange) {
                    onExportFnChange(() => () => {}); // TO-REFACTOR: NULL CALLBACK?
                }
            },
        },
        [content]
    );
    // useEffect(() => {
    //     // TODO: watch out for tiptap performance with render
    //     console.log("tiptapEditor ref changes", new Date());
    // }, [tiptapEditor]);

    if (!tiptapEditor) {
        console.warn("Editor initialization incomplete.");
        return null;
        // TODO: error component here
    }

    return (
        <>
            <EditorContent editor={tiptapEditor} />
            <Menu tiptapEditor={tiptapEditor!} />
        </>
    );
}

/**
 * TODO: custom positioning, position absolute to parents but remains at screen?
 * @param param0
 * @returns
 */
function Menu({ tiptapEditor }: { tiptapEditor: Editor }) {
    const showMenu = tiptapEditor.isEditable;

    return (
        <div
            className={
                (showMenu ? "visible " : "invisible ") +
                "fixed left-0 right-0 bottom-1 mx-auto w-fit space-x-2 p-2"
            }
        >
            <button
                tabIndex={-1}
                className={
                    "p-1 rounded-md hover:bg-gray-200 focus:bg-gray-300" +
                    (tiptapEditor?.isActive("bold") ? " bg-gray-400" : "")
                }
                onClick={() => tiptapEditor.chain().focus().toggleBold().run()}
            >
                <img className="size-4" src={boldIcon} />
            </button>
            <button
                tabIndex={-1}
                className={
                    "p-1 rounded-md hover:bg-gray-200 focus:bg-gray-300" +
                    (tiptapEditor?.isActive("italic") ? " bg-gray-400" : "")
                }
                onClick={() => tiptapEditor.chain().focus().toggleItalic().run()}
            >
                <img className="size-4" src={italicIcon} />
            </button>
            <button
                tabIndex={-1}
                className={
                    "p-1 rounded-md hover:bg-gray-200 focus:bg-gray-300" +
                    (tiptapEditor?.isActive("underline") ? " bg-gray-400" : "")
                }
                onClick={() => tiptapEditor.chain().focus().toggleUnderline().run()}
            >
                <img className="size-4" src={underlineIcon} />
            </button>
        </div>
    );
}
