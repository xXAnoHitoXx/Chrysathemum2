import { is_object, is_string } from "./simple_type";
import { is_response_error, TypeConversionError } from "./validation_error";

export enum Bisquit {
    salon_selection="salon_selection",
}

function is_bisquit(s: string): s is keyof typeof Bisquit {
    return Object.values<string>(Bisquit).includes(s);
}

export function to_bisquit (u:unknown): Bisquit | TypeConversionError {
    if (!is_string(u)) return { error: "unknown aint a Bisquit" };
    if(!is_bisquit(u)) return { error: "Bisquit does not exist" };

    return Bisquit[u];
}

export function to_bisquit_data(u: unknown): { name: Bisquit, value: string } | TypeConversionError {
    if(!is_object(u)) return { error: "unknown aint Bisquit data" };

    if(!("name" in u && "value" in u)) return { error: "unknown aint Bisquit data" };

    const { name, value } = u;

    const bisquit = to_bisquit(name);

    if(is_response_error(bisquit)) return bisquit;
    if(!is_string(value)) return { error: "value aint Bisquit data" };

    return { name: bisquit, value: value };
}
