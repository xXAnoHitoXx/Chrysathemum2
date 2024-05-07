import { type DataSnapshot, get, ref } from "firebase/database";
import { f_db } from "~/server/db_schema";
import { fb_location_entries, type Location } from "~/server/db_schema/fb_schema";

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
