import 'server-only';

import { type DataSnapshot, get, set, remove } from "firebase/database"
import { FireDB } from "~/server/db_schema/fb_schema";
import { Query, QueryError } from '../../server_queries_monad';
import { server_error } from '~/server/server_error';
import { is_string } from '~/server/validation/simple_type';

export const create_technician_migration_index: Query<{ legacy_id: string, technician_id: string },void> =
    async ({ legacy_id, technician_id }: { legacy_id: string, technician_id: string }, f_db: FireDB) => {
        await set(f_db.technician_legacy_index([legacy_id]), technician_id);
    }

export const retrieve_technician_id_from_legacy_id: Query<{ legacy_id: string }, { technician_id: string }> =
    async ({ legacy_id }: { legacy_id: string }, f_db: FireDB): Promise<{ technician_id: string } | QueryError> => {
        const data: DataSnapshot = await get(f_db.technician_legacy_index([legacy_id]));

        if(!data.exists()){
            return server_error("there is no mapping for technician {".concat(legacy_id, "}"));
        }

        const result: unknown = data.val();
        if(!is_string(result)) {
            return server_error("corrupted login entry");
        }

        return { technician_id: result };
    }

export const delete_technician_migration_index: Query<{ legacy_id: string }, void> = 
    async ({ legacy_id }: { legacy_id: string }, f_db: FireDB) => {
        await remove(f_db.technician_legacy_index([legacy_id]));
    }
