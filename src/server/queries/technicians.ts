import { push, ref, set, get, update } from "firebase/database";
import type { DatabaseReference, DataSnapshot } from "firebase/database";
import { f_db } from "../db";
import { fb_technicians } from "../db/fb_schema";
import type { Technician } from "../db/fb_schema";

export async function create_technician(name: string, color: string){
    const id: DatabaseReference = push(ref(f_db, fb_technicians()));

    if(id.key == null) {
        throw new Error("failed to create an id for technician");
    }

    const tech: Technician = {
        id: id.key,
        name: name,
        color: color,
    };

    await set(id, tech);
}

export async function get_all_technicians(): Promise<Technician[]> {
    const data: DataSnapshot = await get(ref(f_db, fb_technicians()));

    if(!data.exists()) {
        return [];
    }

    const techs: Technician[] = [];

    data.forEach((child) => {
        techs.push(child.val() as Technician)
    });

    return techs;
}

export async function update_technician(tech: Technician){
    await update(ref(f_db, fb_technicians().concat(tech.id)), { name: tech.name, color: tech.color });
}
