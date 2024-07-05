import { cookies } from "next/headers";
import { pack } from "~/server/queries/server_queries_monad";
import { parse_request } from "../server_parser";
import { Bisquit, to_bisquit } from "~/server/validation/bisquit";

export async function POST(request: Request): Promise<Response> {
    await pack(request).bind(parse_request(to_bisquit)).bind(async (bisquit: Bisquit) => {
        const cookies_store = cookies();
        cookies_store.set(bisquit.name, bisquit.data);
    }).unpack();
    return new Response();
}
