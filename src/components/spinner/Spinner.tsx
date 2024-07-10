/**
 * Very simple spinner. size defaults to font-size
 * TODO: add variant colors & size
 */
export function Spinner() {
    return (
        <div
            className={
                "size-4 " +
                "inline-block " +
                "border-2 border-white-800 border-t-transparent rounded-full " +
                "animate-spin"
            }
        ></div>
    );
}
