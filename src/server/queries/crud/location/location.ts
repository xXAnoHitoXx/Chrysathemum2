import { type DataSnapshot, get, ref, set } from "firebase/database";
import { f_db } from "~/server/db_schema";
import { fb_location_entries, type Location } from "~/server/db_schema/fb_schema";

export async function create_new_location({ id, address }: { id: string, address: string }, redirect: string ): Promise<Location> {
    const location: Location = { id: id, address: address };
    await set(ref(f_db, fb_location_entries(redirect).concat(id)), location);

    return location;
}

export async function retrieve_location({ id }: { id: string }, redirect: string): Promise<Location | null> {
    const data: DataSnapshot = await get(ref(f_db, fb_location_entries(redirect).concat(id)));

    if(!data.exists()) {
        return null;
    }

    return data.val() as Location;
}


