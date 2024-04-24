import { push, ref, set, update } from "firebase/database";
import type { DatabaseReference } from "firebase/database";
import { f_db } from "../db";
import { fb_technicians } from "../db/fb_schema";
import type { Technician } from "../db/fb_schema";

export async function create_technician(name: string, color: string){
    const id: DatabaseReference = push(ref(f_db, fb_technicians));

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

export async function update_technician(tech: Technician){
    await update(ref(f_db, fb_technicians.concat(tech.id)), { name: tech.name, color: tech.color });
}
