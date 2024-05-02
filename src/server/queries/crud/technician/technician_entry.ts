import { type DatabaseReference, push, ref, set, get, type DataSnapshot, update, remove } from "firebase/database";
import { f_db } from "~/server/db_schema";
import { fb_technician_entries, type Technician } from "~/server/db_schema/fb_schema";

export async function create_technician_entry({ name, color, active }: { name: string, color: string, active: boolean }, redirect: string): Promise<Technician> {
    const id_ref: DatabaseReference = push(ref(f_db, fb_technician_entries(redirect)));

    if(id_ref.key == null) {
        throw new Error("failed to create technician_entry null id");
    }

    const technician_entry: Technician = {
        id: id_ref.key,
        name: name,
        color: color,
        active: active,
    }

    await set(id_ref, technician_entry);
    return technician_entry;
}

export async function retrieve_technician_entry(id: string, redirect: string): Promise<Technician | null> {
    const data: DataSnapshot = await get(ref(f_db, fb_technician_entries(redirect).concat(id)));

    if(!data.exists()){
        return null;
    }

    return data.val() as Technician;
}

export async function update_technician_entry( technician: Technician, redirect: string) {
    await update(
        ref(f_db, fb_technician_entries(redirect).concat(technician.id)), 
        { name: technician.name, color: technician.color, active: technician.active }
    );
}

export async function delete_technician_entry(id: string, redirect: string){
    await remove(ref(f_db, fb_technician_entries(redirect).concat(id)));
}
