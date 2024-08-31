"server only";

import { cookies } from "next/headers";
import { data_error, DataError } from "~/server/data_error";
import {
    ErrorMessage_BisquitRetrival,
    ErrorMessage_DoesNotExist,
} from "~/server/error_messages/messages";
import { Bisquit } from "~/server/validation/bisquit";

export function get_bisquit(name: Bisquit): string | DataError {
    const cookies_store = cookies();
    const bisquit = cookies_store.get(name)?.value;
    if (bisquit == undefined)
        return data_error(
            ErrorMessage_BisquitRetrival,
            ErrorMessage_DoesNotExist,
        );
    return bisquit;
}

export function set_bisquit({ name, value }: { name: Bisquit; value: string }) {
    const cookies_store = cookies();
    cookies_store.set(name, value);
}
