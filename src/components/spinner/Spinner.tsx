import { experimental } from "../../theme/theme";

/**
 * Very simple spinner. size defaults to font-size
 * TODO: add variant colors & size
 */
export type SpinnerProps = {
    variant?: "white" | "primary" | "secondary";
    size?: "sm" | "md" | "lg";
};

const styles = {
    white: "border-white-800",
    primary: experimental.colors.zen60.border,
    secondary: experimental.colors.zen30.border,
    get default() {
        return this.white;
    },
};
const sizes = {
    sm: "size-4",
    md: "size-6",
    lg: "size-8",
    get default() {
        return this.md;
    },
};
export function Spinner({ variant, size }: SpinnerProps) {
    return (
        <div
            className={
                (variant ? styles[variant] : styles.default) +
                " " +
                (size ? sizes[size] : sizes.default) +
                " " +
                "inline-block " +
                "border-2 border-t-transparent rounded-full " +
                "animate-spin"
            }
        ></div>
    );
}
