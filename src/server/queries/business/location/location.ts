import { DEFAULT_VALUE, type Technician } from "~/server/db_schema/type_def";
import { assign_technician_to_roster, remove_technician_from_roster, retrieve_roster } from "~/server/queries/crud/location/location_roster";
import { get_all_technicians, mark_technician_active } from "~/server/queries/business/technician/technician_queries";
import { Query, QueryError } from "~/server/queries/server_queries_monad";
import { FireDB } from "~/server/db_schema/fb_schema";
import { is_server_error } from "~/server/server_error";

export const assign_technician_to_location: Query< 
    { location_id: string, technician: Technician }, 
    Technician
> = async ({ location_id, technician }, f_db: FireDB ) => {
        const err = await assign_technician_to_roster({ 
            location_id: location_id, 
            technician: { technician_id: technician.id, color: technician.color },
        }, f_db);
       
        if(is_server_error(err)) {
            return err;
        }
        
        return mark_technician_active(technician, f_db);
    }

export const remove_technician_from_location = remove_technician_from_roster;

export const retrieve_technicians_at_location: Query<{ location_id: string }, Technician[]> =
    async (data, f_db: FireDB): Promise<Technician[] | QueryError> => {
        const v: void = undefined;
        const roster = await retrieve_roster(data, f_db);
        const technicians = await get_all_technicians(v, f_db);

        if(is_server_error(roster)) { return roster }
        if(is_server_error(technicians)) { return technicians }

        const local_color_record : Record<string, string> = {}
        const local_tech_ids: string[] = [];
        for (const {technician_id, color} of roster) {
            if(color !== DEFAULT_VALUE) {
                local_color_record[technician_id] = color;
            }
            local_tech_ids.push(technician_id);
        }

        return technicians.filter((t: Technician) => (
            local_tech_ids.includes(t.id)
        )).map((t: Technician) => {
            const local_color = local_color_record[t.id];
            if(local_color != undefined) {
                t.color = local_color;
            }
            return t;
        });
    }
