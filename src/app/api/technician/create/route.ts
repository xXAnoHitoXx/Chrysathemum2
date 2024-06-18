import { pack } from "~/server/queries/server_queries_monad";
import { to_technician_creation_info } from "./validation";
import { create_new_technician } from "~/server/queries/business/technician/technician_queries";
import { parse_request, unpack_response } from "../../server_parser";

export async function POST(request: Request): Promise<Response> {
    const technician_creation_query = pack(request)
        .bind(parse_request(to_technician_creation_info))
        .packed_bind(create_new_technician);
    return unpack_response(technician_creation_query);
}
