import { DataError, is_data_error } from "../generic_query/data_error";

export function is_string(t: unknown): t is string {
    if (t == null) {
        return false;
    }

    return typeof t === "string";
}

export function is_boolean(t: unknown): t is boolean {
    if (t == null) {
        return false;
    }

    return typeof t === "boolean";
}

export function is_function(t: unknown): t is Function {
    if (t == null) {
        return false;
    }

    return typeof t === "function";
}

export function is_number(t: unknown): t is number {
    if (t == null) {
        return false;
    }

    return typeof t === "number";
}

export function is_big_int(t: unknown): t is BigInt {
    if (t == null) {
        return false;
    }

    return typeof t === "bigint";
}

export function is_object(t: unknown): t is object {
    if (t == null) {
        return false;
    }

    return typeof t === "object";
}

export function to_array<T>(
    to: (t: unknown) => T | DataError,
): (t: unknown) => T[] | DataError {
    return (t: unknown) => {
        if (!Array.isArray(t)) {
            return new DataError("not an array");
        }

        const arr: T[] = [];

        for (const element of t) {
            const e = to(element);
            if (is_data_error(e)) {
                return e.stack("an array element is not of type T");
            }
            arr.push(e);
        }

        return arr;
    };
}
