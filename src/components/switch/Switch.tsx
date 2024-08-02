import { ChangeEvent, useState } from "react";

export type SwitchProps = {
    variant?: "primary" | "secondary";
    id?: string;
    checked?: boolean;
    disabled?: boolean;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    size?: "sm" | "md" | "lg";
};

const sizeStyles = {
    sm: "w-[2rem] h-[1rem]",
    md: "h-[1.5rem] w-[3rem]",
    lg: "h-[2rem] w-[4rem]",
    get default() {
        return this.md;
    },
};

const colorStyles = {
    //input box = 0, circle = 1
    primary: ["border border-blue-600", "bg-blue-600"],
    secondary: ["border border-black", "bg-black"],
    get default() {
        return this.primary;
    },
};

export function Switch(props: SwitchProps) {
    const {
        onChange,
        id,
        disabled,
        checked: checkedProp = false,
        size = "md",
        variant = "primary",
    } = props;

    const [checked, setChecked] = useState(checkedProp);

    return (
        <div className="inline-block relative">
            <div
                className={[
                    sizeStyles[size],
                    colorStyles[variant][0],
                    !checked ? "bg-transparent" : "bg-gray-300",
                    "p-[2px] absolute top-0 left-0 rounded-full pointer-events-none",
                ].join(" ")}
            >
                <div
                    className={[
                        colorStyles[variant][1],
                        "rounded-full h-full aspect-square",
                        "pointer-events-none transition",
                        !checked ? "translate-x-0" : "translate-x-[calc(100%+5px)]",
                    ].join(" ")}
                ></div>
            </div>
            <input
                id={id}
                className={[
                    "appearance-none rounded-full block cursor-pointer",
                    sizeStyles[size],
                ].join(" ")}
                role="switch"
                type="checkbox"
                onChange={(e) => {
                    setChecked(e.target.checked);
                    if (onChange) {
                        onChange(e);
                    }
                }}
                disabled={disabled}
                checked={checked}
            />
        </div>
    );
}
