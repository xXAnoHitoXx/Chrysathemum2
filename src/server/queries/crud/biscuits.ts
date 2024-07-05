'server only'

import { cookies } from "next/headers";
import { Bisquit } from "~/server/validation/bisquit";

export function get_bisquit(name: Bisquit): string | undefined {
    const cookies_store = cookies();
    return cookies_store.get(name)?.value;
}

export function set_bisquit({ name, value }: { name: Bisquit, value: string }) {
    const cookies_store = cookies();
    cookies_store.set(name, value);
}
