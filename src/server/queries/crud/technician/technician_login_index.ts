import 'server-only';

import { type DataSnapshot, get, set, remove } from "firebase/database"
import { FireDB } from "~/server/db_schema/fb_schema";
import { Query, QueryError } from '../../server_queries_monad';
import { server_error } from '~/server/server_error';
import { is_string } from '~/server/validation/simple_type';

export const create_technician_login_index: Query<{ user_id: string, technician_id: string }, void> =
    async ({ user_id, technician_id }: { user_id: string, technician_id: string }, f_db: FireDB) => {
        await set(f_db.technician_login([user_id]), technician_id);
    }

export const retrieve_technician_id_from_user_id: Query<{ user_id: string }, { technician_id: string }> =
    async ({ user_id }: { user_id: string }, f_db: FireDB): Promise<{ technician_id: string } | QueryError> => {
        const data: DataSnapshot = await get(f_db.technician_login([user_id]));

        if(!data.exists()){
            return server_error("user does not have an entry in technician_login index");
        }

        const result: unknown = data.val();
        if(!is_string(result)) {
            return server_error("corrupted login entry");
        }

        return { technician_id: result };
    }

export const delete_technician_login_index: Query<{ user_id: string }, void> =
    async ({ user_id }: { user_id: string }, f_db: FireDB) => {
        await remove(f_db.technician_login([user_id]));
    }
