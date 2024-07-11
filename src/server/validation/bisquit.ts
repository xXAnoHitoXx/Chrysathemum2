import { data_error, DataError, is_data_error } from "../data_error";
import { is_object, is_string } from "./simple_type";

export enum Bisquit {
    salon_selection="salon_selection",
}

function is_bisquit(s: string): s is keyof typeof Bisquit {
    return Object.values<string>(Bisquit).includes(s);
}

export function to_bisquit (u:unknown): Bisquit | DataError {
    if (!is_string(u)) 
        return data_error( "Casting to Bisquit", "not a string", );

    if(!is_bisquit(u)) 
        return data_error( "Casting to Bisquit", "no Bisquit associated with string u", );

    return Bisquit[u];
}

export function to_bisquit_data(u: unknown): { name: Bisquit, value: string } | DataError {
    if(!is_object(u)) 
        return data_error( "Casting to Bisquit data", "not an object", );

    if(!("name" in u && "value" in u)) 
        return data_error( "Casting to Bisquit data", "missing field", );

    const { name, value } = u;

    const bisquit = to_bisquit(name);

    if(is_data_error(bisquit)) 
        return data_error( "Casting to Bisquit data", "name must be a Bisquit", );

    if(!is_string(value)) 
        return data_error( "Casting to Bisquit data", "value must be a string", );

    return { name: bisquit, value: value };
}
