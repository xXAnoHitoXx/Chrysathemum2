import { is_response_error, TypeConversionError } from "./validation_error";

export function is_string(t: unknown): t is string {
    if (t == null) {
        return false;
    }

    return (typeof t === "string");
}

export function is_boolean(t: unknown): t is boolean {
    if (t == null) {
        return false;
    }

    return (typeof t === "boolean");
}

export function is_number(t: unknown): t is number {
    if (t == null) {
        return false;
    }

    return (typeof t === "number");
}

export function is_object(t: unknown): t is object {
    if (t == null) {
        return false;
    }

    return (typeof t === "object");
}

export function to_array<T>(to: (t: unknown) => T | TypeConversionError): (t: unknown) => T[] | TypeConversionError {
    return (t: unknown) => {
        if(!Array.isArray(t)) {
            return { error: "not an array" };
        }

        const arr: T[] = [];

        for (const element of t) {
            const e = to(element);
            if (!is_response_error(e)) {
                arr.push(e);
            }
        }

        return arr;
    }
}
