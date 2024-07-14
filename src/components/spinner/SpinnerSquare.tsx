import { experimental } from "../../theme/theme";
import "./spinner-square.css";

/**
 * Specifies size & position in classname
 * @returns
 */
export function SpinnerSquare({ className }: { className: string }) {
    const bgGradient = `linear-gradient(${experimental.colors.zen30.raw} 0 0)`;

    const bgStyles: React.CSSProperties = {
        background: [
            bgGradient + " left top no-repeat",
            bgGradient + " right top no-repeat",
            bgGradient + " bottom right no-repeat",
            bgGradient + " bottom left no-repeat",
        ].join(", "),
    };
    return (
        <>
            <div className={"spinner-square " + className} style={bgStyles}></div>
        </>
    );
}
