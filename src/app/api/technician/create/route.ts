import { pack } from "~/server/queries/server_queries_monad";
import { to_technician_creation_info } from "./validation";
import { create_new_technician } from "~/server/queries/business/technician/technician_queries";
import { parse_request, unpack_response } from "../../server_parser";
import { require_permission, Role } from "../../c_user";

export async function POST(request: Request): Promise<Response> {
    await require_permission([Role.Operator, Role.Admin]).catch(() => {
        return Response.error();
    });

    const technician_creation_query = pack(request)
        .bind(parse_request(to_technician_creation_info))
        .bind(create_new_technician);
    return unpack_response(technician_creation_query);
}
