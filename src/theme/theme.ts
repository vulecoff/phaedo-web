// TODO: semantic colors & systematic configurations for tailwind
/**
 * Themes for Tailwind
 */
export type ColorVariant = "red" | "blue" | "outline-primary";

export const experimental = {
    colors: {
        zen60: {
            raw: "#DDDBC7",
            bg: "bg-[#DDDBC7]",
            hoverBg: "hover:bg-[#DDDBC7]",
            border: "border-[#DDDBC7]",
            text: "text-[#DDDBC7]",
        },
        zen30: {
            raw: "#007562",
            bg: "bg-[#007562]",
            hoverBg: "hover:bg-[#007562]",
            border: "border-[#007562]",
            outline: "outline-[#007562]",
            text: "text-[#007562]",
        },
        zen10: [
            {
                raw: "#C3FCF2",
                bg: "bg-[#C3FCF2]",
                hoverBg: "hover:bg-[#C3FCF2]",
                border: "border-[#C3FCF2]",
            },
            {
                raw: "#659B91",
            },
        ],
    },
    fonts: {
        zillaSlab: "font-['Zilla_Slab']",
    },
};

// currently used for buttons
export const colorVariantStyles = {
    blue: ["bg-blue-500", "hover:bg-blue-600", "text-white"].join(" "),
    red: ["bg-red-500", "hover:bg-red-600", "text-white"].join(" "),
    "outline-primary": [
        "text-black hover:text-white",
        experimental.colors.zen30.hoverBg,
        "border border-black",
    ].join(" "),
    // "solid-secondary": ["text-white"].join(" "),

    get default() {
        return this.blue;
    },
};
