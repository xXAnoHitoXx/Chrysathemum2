import { parse_request } from "../../request_parser";
import { to_technician } from "~/server/validation/db_types/technician_validation";
import { mark_technician_inactive } from "~/server/queries/business/technician/technician_queries";
import { unpack_response } from "../../response_parser";
import { pack } from "~/server/queries/server_queries_monad";

export async function PATCH(request: Request): Promise<Response> {
    const query = pack(request).bind(parse_request(to_technician))
        .bind(mark_technician_inactive);
    return unpack_response(query);
}
