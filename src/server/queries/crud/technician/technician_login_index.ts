import 'server-only';

import { type DataSnapshot, get, ref, set, remove } from "firebase/database"
import { f_db } from "~/server/db_schema";
import { fb_technicians_login } from "~/server/db_schema/fb_schema";

export async function create_technician_login_index({user_id, technician_id}: {user_id: string, technician_id: string}, redirect: string) {
    await set(ref(f_db, fb_technicians_login(redirect).concat(user_id)), technician_id);
}

export async function retrieve_technician_id_from_user_id(user_id: string, redirect: string): Promise<string | null> {
    const data: DataSnapshot = await get(ref(f_db, fb_technicians_login(redirect).concat(user_id)));

    if(!data.exists()){
        return null;
    }

    return data.val() as string;
}

export async function delete_technician_login_index(user_id: string, redirect: string) {
    await remove(ref(f_db, fb_technicians_login(redirect).concat(user_id)));
}
