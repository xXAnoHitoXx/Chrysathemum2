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

export function is_object(t: unknown): t is object {
    if (t == null) {
        return false;
    }

    return (typeof t === "object");
}
