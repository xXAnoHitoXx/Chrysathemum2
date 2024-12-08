import { pack } from "~/server/queries/server_queries_monad";
import {
    handle_void_return,
    parse_request,
    unpack_response,
} from "../server_parser";
import { to_bisquit_data } from "~/server/validation/bisquit";
import { set_bisquit } from "~/server/queries/crud/biscuits";
import { require_permission, Role } from "../c_user";

export async function POST(request: Request): Promise<Response> {
    await require_permission([Role.Operator, Role.Admin]).catch(() => {
        return Response.error();
    });

    const query = pack(request)
        .bind(parse_request(to_bisquit_data))
        .bind(set_bisquit)
        .bind(handle_void_return);
    return unpack_response(query);
}
