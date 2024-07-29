import { SetStateAction } from "react";
import { NavLink } from "react-router-dom";
import burgerIcon from "../assets/burger.svg";

/**
 * Side bar navigation
 * @returns
 */
export function SideBar(props: {
    sideBarHide: boolean;
    setSideBarHide: React.Dispatch<SetStateAction<boolean>>;
}) {
    const { sideBarHide, setSideBarHide } = props;
    const sideBarStyles = [
        // TODO: high-coupling with Layout
        "w-[4rem] data-[hide=false]:w-[12rem]",
        "sm:data-[hide=true]:w-[4rem] sm:data-[hide=false]:w-[12rem]",
        "transition-all",
        "min-h-full p-4 fixed top-0 left-0 flex flex-col",
        "bg-inherit",
        "z-40",
    ];
    const navStyles = [
        "flex flex-col mt-10 items-center",
        "-translate-x-[12rem] data-[hide=false]:translate-x-0",
        "transition-all",
    ];
    const sideBarRoutes = [
        ["Home", "/"],
        ["Notes", "/notes"],
        ["Quick Review", "/quiz"],
        ["Playground", "/playground"],
    ];
    return (
        <>
            <div data-hide={sideBarHide} className={sideBarStyles.join(" ").trim()}>
                <button
                    className="mx-auto"
                    onClick={(e) => {
                        setSideBarHide(!sideBarHide);
                    }}
                >
                    <img src={burgerIcon} className="size-4" />
                </button>
                <nav data-hide={sideBarHide} className={navStyles.join(" ")}>
                    {sideBarRoutes.map((item, idx) => (
                        <NavLink
                            key={idx}
                            to={item[1]}
                            className={[
                                "uppercase py-[2px] relative",
                                "after:inline-block after:h-[2px] after:w-full after:absolute after:scale-x-0 after:left-0 after:bottom-[2px]",
                                "hover:after:bg-gray-700 hover:after:scale-x-100 after:transition",
                                "after:origin-left",
                            ].join(" ")}
                        >
                            {item[0]}
                        </NavLink>
                    ))}
                </nav>
            </div>
            <div
                data-show={!sideBarHide}
                className="hidden data-[show=true]:block sm:data-[show=true]:hidden fixed w-full h-full top-0 left-0 z-10 bg-black opacity-50"
                onClick={() => {
                    setSideBarHide(!sideBarHide);
                }}
            ></div>
        </>
    );
}
