import 'server-only';

import { type DatabaseReference, push, set, get, type DataSnapshot, update, remove } from "firebase/database";
import { FireDB } from "~/server/db_schema/fb_schema";
import type { Technician } from '~/server/db_schema/type_def';
import { QueryError, Query } from '../../queries_monad';
import { server_error } from '~/server/server_error';
import { to_technician } from '~/server/validation/technician_validation';

export const create_technician_entry: Query<{ name: string, color: string, active: boolean }, Technician> =
    async (params: { name: string, color: string, active: boolean }, f_db: FireDB) : Promise<Technician | QueryError> => {
        const id_ref: DatabaseReference = await push(f_db.technician_entries([]));

        if(id_ref.key == null) {
            return server_error("failed to create technician_entry null id");
        }

        const technician_entry: Technician = {
            id: id_ref.key,
            name: params.name,
            color: params.color,
            active: params.active,
        }

        await set(id_ref, technician_entry);
        return technician_entry;
        
    }

export const retrieve_technician_entry: Query<{ id: string }, Technician> =
    async ({ id }: { id: string }, f_db: FireDB): Promise<Technician | QueryError> => {
        const data: DataSnapshot = await get(f_db.technician_entries([id]));

        if(!data.exists()){
            return server_error("retrieving non exist Technician {".concat(id, "}"));
        }

        return to_technician(data.val());
    }

export const update_technician_entry: Query<Technician, void> =
    async (technician: Technician, f_db: FireDB): Promise<void> => {
        await update(
            f_db.technician_entries([technician.id]), 
            { name: technician.name, color: technician.color, active: technician.active }
        );
    }

export const delete_technician_entry: Query<{ id: string },void> =
    async ({ id }: { id: string }, f_db: FireDB): Promise<void> => {
        await remove(f_db.technician_entries([id]));
    }
