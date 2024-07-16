import { handle_void_return, parse_request, unpack_response } from "~/app/api/server_parser";
import type { Technician } from "~/server/db_schema/type_def"
import { assign_technician_to_location, remove_technician_from_location } from "~/server/queries/business/location/location";
import { map, pack } from "~/server/queries/server_queries_monad";
import { to_technician } from "~/server/validation/db_types/technician_validation";

export async function POST(request: Request, { params }: { params: { salon: string } } ): Promise<Response> {
    const query = pack(request).bind(parse_request(to_technician))
        .bind(map((t: Technician) => ({ location_id: params.salon, technician: t })))
        .bind(assign_technician_to_location)
    return unpack_response(query);
}

export async function DELETE(request: Request, { params }: { params: { salon: string } } ): Promise<Response> {
    const query = pack(request).bind(parse_request(to_technician))
        .bind(map((t: Technician) => ({ location_id: params.salon, technician_id: t.id })))
        .bind(remove_technician_from_location)
        .bind(handle_void_return)
    return unpack_response(query);
}
