import type { Technician } from "~/server/db_schema/type_def";
import { assign_technician_to_roster } from "~/server/queries/crud/location/location_roster";
import { mark_technician_active } from "~/server/queries/business/technician/technician_queries";
import { Query, ServerQueryData, map, merge } from "~/server/queries/server_queries_monad";

export const assign_technician_to_location: Query< 
    ServerQueryData<{ location_id: string, technician: Technician }>, 
    void 
> = async (data: ServerQueryData<{ location_id: string, technician: Technician }>) => {
        const to_roster = data.bind(map(
            ({location_id, technician}) => ({ 
                location_id: location_id, 
                technician: { technician_id: technician.id, color: technician.color } 
            })
        )).bind(assign_technician_to_roster)
       
        const mark_active = data.bind(map(
            ({ technician } ) => (technician)
        )).packed_bind(mark_technician_active);
        
        return await merge(to_roster, mark_active, () => {}).unpack();
    }

/*
export async function remove_technician_from_location({ location_id, technician_id }: { location_id: string, technician_id: string}, redirect = "") {
    await remove(ref(f_db, fb_location_roster(redirect).concat(location_id, "/", technician_id)));
}

export async function retrieve_technicians_at(location_id: string, redirect = ""): Promise<Technician[]> {
    const active_tech: Technician[] = await get_active_technicians(redirect);
    const roster: string[] = await retrieve_roster_ids(location_id, redirect);
    return active_tech.filter((tech) => (roster.includes(tech.id)));
}
*/
