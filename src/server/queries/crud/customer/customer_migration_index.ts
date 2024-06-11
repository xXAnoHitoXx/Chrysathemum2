import 'server-only';

import { type DataSnapshot, set, get, remove } from "firebase/database";
import { FireDB } from "~/server/db_schema/fb_schema";
import { Query, QueryError } from '../../server_queries_monad';
import { server_error } from '~/server/server_error';
import { is_string } from '~/server/validation/simple_type';

export const create_customer_migration_index: Query<{ customer_id: string, legacy_id: string }, void> = 
    async (params: { customer_id: string, legacy_id: string }, f_db: FireDB) => {
        await set(f_db.customers_legacy_id_index([params.legacy_id]), params.customer_id);
    }

export const retrieve_customer_id_from_legacy_id: Query<{ legacy_id: string }, { customer_id: string | null }> =
    async (params: { legacy_id: string }, f_db: FireDB): Promise<{ customer_id: string | null } | QueryError> => {
        const data: DataSnapshot = await get(f_db.customers_legacy_id_index([params.legacy_id]));

        if(!data.exists()) {
            return { customer_id: null };
        }
        
        const result: unknown = data.val();

        if(!is_string(result)) {
            return server_error("legacy index {".concat(params.legacy_id, "} is not string"));
        }
        
        return { customer_id: result};
    }

export const delete_customer_migration_index: Query<{ legacy_id: string }, void> = 
    async (params: { legacy_id: string }, f_db: FireDB) => {
        await remove(f_db.customers_legacy_id_index([params.legacy_id]));
    }
