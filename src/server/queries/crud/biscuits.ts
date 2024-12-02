"server only";

import { cookies } from "next/headers";
import { data_error, DataError } from "~/server/data_error";
import {
    ErrorMessage_BisquitRetrival,
    ErrorMessage_DoesNotExist,
} from "~/server/error_messages/messages";
import { Bisquit } from "~/server/validation/bisquit";

export async function get_bisquit(name: Bisquit): Promise<string | DataError> {
    const cookies_store = await cookies();
    const bisquit = cookies_store.get(name)?.value;
    if (bisquit == undefined)
        return data_error(
            ErrorMessage_BisquitRetrival,
            ErrorMessage_DoesNotExist,
        );
    return bisquit;
}

export async function set_bisquit({ name, value }: { name: Bisquit; value: string }) {
    const cookies_store = await cookies();
    cookies_store.set(name, value);
}
