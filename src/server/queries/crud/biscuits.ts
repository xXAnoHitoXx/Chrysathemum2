"server only";

import { cookies } from "next/headers";
import { data_error, DataError } from "~/server/data_error";
import { Bisquit } from "~/server/validation/bisquit";

export function get_bisquit(name: Bisquit): string | DataError {
    const cookies_store = cookies();
    const bisquit = cookies_store.get(name)?.value;
    if (bisquit == undefined)
        return data_error("Retrieving Bisquit", "does not exist");
    return bisquit;
}

export function set_bisquit({ name, value }: { name: Bisquit; value: string }) {
    const cookies_store = cookies();
    cookies_store.set(name, value);
}
