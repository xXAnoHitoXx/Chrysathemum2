import {
    handle_void_return,
    parse_request,
    unpack_response,
} from "~/app/api/server_parser";
import { is_data_error } from "~/server/data_error";
import type { Technician } from "~/server/db_schema/type_def";
import {
    assign_technician_to_location,
    remove_technician_from_location,
} from "~/server/queries/business/location/location";
import { get_active_technicians } from "~/server/queries/business/technician/technician_queries";
import { get_bisquit } from "~/server/queries/crud/biscuits";
import { retrieve_roster } from "~/server/queries/crud/location/location_roster";
import { pack } from "~/server/queries/server_queries_monad";
import { Bisquit } from "~/server/validation/bisquit";
import { to_technician } from "~/server/validation/db_types/technician_validation";
import { require_permission, Role } from "../../c_user";

export async function GET() {
    await require_permission([Role.Operator, Role.Admin]).catch(() => {
        return Response.error();
    });

    const query = pack(Bisquit.salon_selection)
        .bind(get_bisquit)
        .bind(async (salon, f_db) => {
            const active_technicians_query = get_active_technicians(
                undefined as void,
                f_db,
            );
            const roster_query = retrieve_roster({ location_id: salon }, f_db);

            const active_technicians = await active_technicians_query;
            const roster = await roster_query;

            if (is_data_error(active_technicians))
                return active_technicians.stack(
                    "api/technician/location/GET",
                    "failed to retrieve active technicians",
                );
            if (is_data_error(roster))
                return roster.stack(
                    "api/technician/location/GET",
                    "failed to retrieve roster",
                );

            return active_technicians.filter((tech) => {
                for (let i = 0; i < roster.length; i++) {
                    if (roster[i]?.technician_id == tech.id) return true;
                }
                return false;
            });
        });

    return unpack_response(query);
}

export async function POST(request: Request): Promise<Response> {
    await require_permission([Role.Operator, Role.Admin]).catch(() => {
        return Response.error();
    });

    const query = pack(request)
        .bind(parse_request(to_technician))
        .bind(async (t: Technician) => {
            const salon = await get_bisquit(Bisquit.salon_selection);
            if (is_data_error(salon))
                return salon.stack(
                    "Posting Technician",
                    "posting to unknown location",
                );

            return {
                location_id: salon,
                technician: t,
            };
        })
        .bind(assign_technician_to_location);
    return unpack_response(query);
}

export async function DELETE(request: Request): Promise<Response> {
    await require_permission([Role.Operator, Role.Admin]).catch(() => {
        return Response.error();
    });

    const query = pack(request)
        .bind(parse_request(to_technician))
        .bind(async (t: Technician) => {
            const salon = await get_bisquit(Bisquit.salon_selection);
            if (is_data_error(salon))
                return salon.stack(
                    "Posting Technician",
                    "posting to unknown location",
                );

            return {
                location_id: salon,
                technician_id: t.id,
            };
        })
        .bind(remove_technician_from_location)
        .bind(handle_void_return);
    return unpack_response(query);
}
