import { pack } from "~/server/queries/server_queries_monad";
import { parse_request, unpack_response } from "../server_parser";
import { to_bisquit_data } from "~/server/validation/bisquit";
import { set_bisquit } from "~/server/queries/crud/biscuits";

export async function POST(request: Request): Promise<Response> {
    const query = pack(request).bind(parse_request(to_bisquit_data))
    .bind(set_bisquit);
    return unpack_response(query);
}
