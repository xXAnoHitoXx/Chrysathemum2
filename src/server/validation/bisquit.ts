import { is_object, is_string } from "./simple_type";
import { TypeConversionError } from "./validation_error";

export type Bisquit = {
    name: string,
    data: string,
}

export function to_bisquit (u:unknown): Bisquit|TypeConversionError {
    if (!is_object(u)) return { error: "unknown aint a Bisquit" };

    if (!("name" in u && "data" in u)) return { error: "unknown aint a Bisquit" };

    const { name, data } = u;

    if (!is_string(name) || ! is_string(data)) return { error: "unknown aint a Bisquit" };

    return { name: name, data: data };
}
