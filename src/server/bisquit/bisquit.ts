import { cookies } from "next/headers";
import { DataError } from "../data_error";
import { z } from "zod";

export const Bisquit = z.enum(["salon_selection"]);
export type Bisquit = z.infer<typeof Bisquit>;

export const BisquitStore = z.object({
    name: Bisquit,
    value: z.string(),
});
export type BisquitStore = z.infer<typeof BisquitStore>;

export async function get_bisquit(name: Bisquit): Promise<string | DataError> {
    const cookies_store = await cookies();
    const bisquit = cookies_store.get(name)?.value;
    if (bisquit == undefined)
        return new DataError("no bisquit");
    return bisquit;
}

export async function set_bisquit({ name, value }: BisquitStore) {
    const cookies_store = await cookies();
    cookies_store.set(name, value);
}
