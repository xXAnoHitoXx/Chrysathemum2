import { to_technician } from "~/server/validation/db_types/technician_validation";
import { mark_technician_inactive } from "~/server/queries/business/technician/technician_queries";
import { pack } from "~/server/queries/server_queries_monad";
import { parse_request, unpack_response } from "../../server_parser";
import { require_permission, Role } from "../../c_user";

export async function PATCH(request: Request): Promise<Response> {
    await require_permission([Role.Operator, Role.Admin]).catch(() => {
        return Response.error();
    });

    const query = pack(request)
        .bind(parse_request(to_technician))
        .bind(mark_technician_inactive);
    return unpack_response(query);
}
