// TODO: semantic colors & systematic configurations for tailwind

/**
 * Themes for Tailwind
 */
export type ColorVariant = "red" | "blue";

export const colorVariantStyles = {
    blue: ["bg-blue-500", "hover:bg-blue-600"].join(" "),
    red: ["bg-red-500", "hover:bg-red-600"].join(" "),

    get default() {
        return this.blue;
    },
};

export const experimental = {
    colors: {
        zen: {
            bg: "bg-[#DDDBC7]",
            border: "border-[#DDDBC7]",
        },
    },
    fonts: {
        zillaSlab: "font-['Zilla_Slab']",
    },
};
