import { type DataSnapshot, get, ref, remove } from "firebase/database";
import { f_db } from "~/server/db_schema";
import { fb_location_entries, fb_location_roster } from "~/server/db_schema/fb_schema";
import type { Technician, Location } from "~/server/db_schema/type_def";
import { assign_technician_to_roster, retrieve_roster_ids } from "../crud/location/location_roster";
import { get_active_technicians, mark_technician_active } from "./technician_queries";

export async function get_location_list(redirect = ""): Promise<Location[]> {
    const data: DataSnapshot = await get(ref(f_db, fb_location_entries(redirect)));
    const locations: Location[] = [];

    if(data.exists()){
        data.forEach((child) => {
            locations.push(child.val() as Location);
        });
    }

    return locations;
}

export async function assign_technician_to_location({ location_id, technician }: { location_id: string, technician: Technician}, redirect = "") {
    await assign_technician_to_roster({ 
        location_id: location_id, 
        technician:{ id: technician.id, color: technician.color } 
    }, redirect);

    await mark_technician_active(technician, redirect);
}

export async function remove_technician_from_location({ location_id, technician_id }: { location_id: string, technician_id: string}, redirect = "") {
    await remove(ref(f_db, fb_location_roster(redirect).concat(location_id, "/", technician_id)));
}

export async function retrieve_technicians_at(location_id: string, redirect = ""): Promise<Technician[]> {
    const active_tech: Technician[] = await get_active_technicians(redirect);
    const roster: string[] = await retrieve_roster_ids(location_id, redirect);
    return active_tech.filter((tech) => (roster.includes(tech.id)));
}
