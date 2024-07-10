import { Route, Routes } from "react-router-dom";
import { SideBar } from "./SideBar";
import { ListNotes } from "../features/self-review/ListNotes";
import { CreateOrEditNote } from "../features/self-review/CreateOrEditNote";
import "../assets/zilla-slab-font.css";
import { experimental } from "../theme/theme";
import { useState } from "react";

export function Layout() {
    const [sideBarHide, setSideBarHide] = useState(true);

    const layoutStyles = ["h-screen", experimental.colors.zen.bg, experimental.fonts.zillaSlab];

    // TODO: deduplicate the sizing, but avoid dynamic classes for tailwind
    const mainStyles = [
        "h-full w-[calc(100%-4rem)] sm:w-[calc(100%-12rem)]",
        "data-[sidebarhide=true]:w-[calc(100%-4rem)] sm:data-[sidebarhide=true]:w-[calc(100%-4rem)]",
        "transition-all",
        "ml-auto overflow-y-scroll p-3",
        "z-0 relative isolate",
    ];
    return (
        <div className={layoutStyles.join(" ")}>
            <SideBar sideBarHide={sideBarHide} setSideBarHide={setSideBarHide} />
            <main data-sidebarhide={sideBarHide} className={mainStyles.join(" ")}>
                <Routes>
                    <Route path="/" element={<ListNotes />}></Route>
                    <Route path="/notes" element={<ListNotes />}></Route>
                    <Route path="/notes/:id/edit" element={<CreateOrEditNote />}></Route>
                    <Route path="/notes/create" element={<CreateOrEditNote />}></Route>
                </Routes>
            </main>
        </div>
    );
}
