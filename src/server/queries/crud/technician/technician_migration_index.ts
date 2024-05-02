import 'server-only';

import { type DataSnapshot, get, ref, set, remove } from "firebase/database"
import { f_db } from "~/server/db_schema";
import { fb_technicians_legacy_id_index } from "~/server/db_schema/fb_schema";

export async function create_technician_migration_index({legacy_id, technician_id}: {legacy_id: string, technician_id: string}, redirect: string) {
    await set(ref(f_db, fb_technicians_legacy_id_index(redirect).concat(legacy_id)), technician_id);
}

export async function retrieve_technician_id_from_legacy_id(legacy_id: string, redirect: string): Promise<string | null> {
    const data: DataSnapshot = await get(ref(f_db, fb_technicians_legacy_id_index(redirect).concat(legacy_id)));

    if(!data.exists()){
        return null;
    }

    return data.val() as string;
}

export async function delete_technician_migration_index(legacy_id: string, redirect: string) {
    await remove(ref(f_db, fb_technicians_legacy_id_index(redirect).concat(legacy_id)));
}
