import 'server-only';

import { type DataSnapshot, get, ref, set, remove } from "firebase/database"
import { FireDB } from "~/server/db_schema/fb_schema";
import { Query, QueryError } from '../../queries_monad';
import { server_error } from '~/server/server_error';

export const create_technician_login_index: Query<{ user_id: string, technician_id: string }, void> =
    async ({ user_id, technician_id }: { user_id: string, technician_id: string }, f_db: FireDB): Promise<void> => {
        await set(f_db.technician_login([user_id]), technician_id);
    }

export const retrieve_technician_id_from_user_id: Query<{ user_id: string }, { technician_id: string }> =
    async ({ user_id }: { user_id: string }, f_db: FireDB): Promise<{ technician_id: string } | QueryError> => {
        const data: DataSnapshot = await get(f_db.technician_login([user_id]));

        if(!data.exists()){
            return server_error("user does not have a log in attached");
        }

        return data.val() as string;
    }
/*
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
*/
