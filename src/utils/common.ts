/**
 * Unique 36-bit unique id
 * @returns string
 */
export function uid36(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
