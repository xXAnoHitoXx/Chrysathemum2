import 'server-only';

import { db_query, Query } from '../../server_queries_monad';
import { is_string } from '~/server/validation/simple_type';
import { data_error, is_data_error } from '~/server/data_error';
import { get, remove, set } from 'firebase/database';

export const create_technician_login_index: Query<{ user_id: string, technician_id: string }, void> =
    async ({ user_id, technician_id }, f_db) => {
        return db_query(
            "Creating Technician Login Index", 
            set(f_db.technician_login([user_id]), technician_id)
        );
    }

export const retrieve_technician_id_from_user_id: Query<{ user_id: string }, { technician_id: string }> =
    async ({ user_id }, f_db) => {
        const context = "Login: Retrieve technician_id";

        const data = await db_query(context, get(f_db.technician_login([user_id])));
        if (is_data_error(data)) return data;

        if(!data.exists()){
            return data_error( context, "user is not a registered technician" );
        }

        const result: unknown = data.val();
        if(!is_string(result)) {
            return data_error( context, "corrupted login entry" );
        }

        return { technician_id: result };
    }

export const delete_technician_login_index: Query<{ user_id: string }, void> =
    async ({ user_id }, f_db) => {
        return db_query(
            "Delete technician login index",
            remove(f_db.technician_login([user_id]))
        );
    }
