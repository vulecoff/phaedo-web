import { ColorVariant, colorVariantStyles } from "../../theme/theme";
import { Spinner } from "../spinner/Spinner";

export type ButtonProps = {
    children: React.ReactNode;
    className?: string;
    // onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    disabled?: boolean;
    loading?: boolean;
    type?: string;
    variant?: ColorVariant;
} & React.ComponentProps<"button">;

// TODO: create custom size & variants
export function Button(props: ButtonProps) {
    const { children, className, disabled, loading, type, variant, ...rest } = props;
    const defaultClassNames = [
        variant ? colorVariantStyles[variant] : colorVariantStyles.default, // SET COLOR OF TEXT AND BG
        ...["font-semibold"],
        ...["p-2", "rounded-none"],
        ...["inline-flex", "gap-x-2", "items-center"],
        ...["disabled:pointer-events-none", "disabled:opacity-50"],
    ];
    const mergedClasses = [className, ...defaultClassNames].filter((x) => Boolean(x)).join(" ");
    return (
        <>
            <button type={type || "button"} className={mergedClasses} disabled={disabled} {...rest}>
                {children}
                {loading && <Spinner />}
            </button>
        </>
    );
}
