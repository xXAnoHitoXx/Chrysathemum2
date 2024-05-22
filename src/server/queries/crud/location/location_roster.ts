import { type DataSnapshot, get, ref, set, remove } from "firebase/database";
import { f_db } from "~/server/db_schema";
import { fb_location_roster } from "~/server/db_schema/fb_schema";

export async function assign_technician_to_roster({ location_id, technician }: { location_id: string, technician: { id: string, color: string } }, redirect: string){
    await set(ref(f_db, fb_location_roster(redirect).concat(location_id, "/", technician.id)), technician.color);
}

export async function retrieve_roster_ids(location_id: string, redirect = ""): Promise<string[]>{
    const data: DataSnapshot = await get(ref(f_db, fb_location_roster(redirect).concat(location_id)));
    const ids: string[] = [];

    if(data.exists()) {
        data.forEach((child) => {
            ids.push(child.key);
        });
    }

    return ids;
}

export async function remove_technician_from_roster({ location_id, technician_id }: { location_id: string, technician_id: string }, redirect: string){
    await remove(ref(f_db, fb_location_roster(redirect).concat(location_id, "/", technician_id)));
}
