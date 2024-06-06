import 'server-only';

import { type DataSnapshot, set, get, remove } from "firebase/database";
import { FireDB } from "~/server/db_schema/fb_schema";
import { Query, QueryError } from '../../queries_monad';

export const create_customer_migration_index: Query<{ customer_id: string, legacy_id: string }, null> = 
    async (params: { customer_id: string, legacy_id: string }, f_db: FireDB): Promise<null> => {
        await set(f_db.customers_legacy_id_index([params.legacy_id]), params.customer_id);
        return null;
    }

export const retrieve_customer_id_from_legacy_id: Query<{ legacy_id: string }, { customer_id: string }> =
    async (params: { legacy_id: string }, f_db: FireDB): Promise<{ customer_id: string } | QueryError> => {
        const data: DataSnapshot = await get(f_db.customers_legacy_id_index([params.legacy_id]));

        if(!data.exists()) {
            return new QueryError("legacy index {".concat(params.legacy_id, "} does not exist"));
        }
        
        return { customer_id: data.val() as string };
    }

export const delete_customer_migration_index: Query<{ legacy_id: string }, null> = 
    async (params: { legacy_id: string }, f_db: FireDB): Promise<null> => {
        await remove(f_db.customers_legacy_id_index([params.legacy_id]));
        return null;
    }
