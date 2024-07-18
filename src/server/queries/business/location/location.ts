import { DEFAULT_VALUE, Technician } from "~/server/db_schema/type_def";
import {
    assign_technician_to_roster,
    remove_technician_from_roster,
    retrieve_roster,
} from "~/server/queries/crud/location/location_roster";
import {
    get_all_technicians,
    mark_technician_active,
} from "~/server/queries/business/technician/technician_queries";
import { Query } from "~/server/queries/server_queries_monad";
import { is_data_error, PartialResult } from "~/server/data_error";

export const assign_technician_to_location: Query<
    { location_id: string; technician: Technician },
    Technician
> = async ({ location_id, technician }, f_db) => {
    const context = "Assign Technician to Location";
    const err = await assign_technician_to_roster(
        {
            location_id: location_id,
            technician: {
                technician_id: technician.id,
                color: technician.color,
            },
        },
        f_db,
    );

    if (is_data_error(err)) {
        return err.stack(context, "...");
    }

    const mark = await mark_technician_active(technician, f_db);
    if (is_data_error(mark)) return mark.stack(context, "...");

    return mark;
};

export const remove_technician_from_location = remove_technician_from_roster;

export const retrieve_technicians_at_location: Query<
    { location_id: string },
    PartialResult<Technician[]>
> = async (data, f_db) => {
    const context = "Retrieve Technicians at { ".concat(data.location_id, " }");
    const v: void = undefined;
    const roster = await retrieve_roster(data, f_db);
    if (is_data_error(roster)) {
        return roster.stack(context, "...");
    }

    const technicians = await get_all_technicians(v, f_db);
    if (is_data_error(technicians)) {
        return technicians.stack(context, "...");
    }

    const local_color_record: Record<string, string> = {};
    const local_tech_ids: string[] = [];
    for (const { technician_id, color } of roster) {
        if (color !== DEFAULT_VALUE) {
            local_color_record[technician_id] = color;
        }
        local_tech_ids.push(technician_id);
    }

    const technicians_at_location = technicians.data
        .filter((t: Technician) => local_tech_ids.includes(t.id))
        .map((t: Technician) => {
            const local_color = local_color_record[t.id];
            if (local_color != undefined) {
                t.color = local_color;
            }
            return t;
        });

    return {
        data: technicians_at_location,
        error: technicians.error,
    };
};
