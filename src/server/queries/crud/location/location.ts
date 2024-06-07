import { type DataSnapshot, get, set } from "firebase/database";
import { FireDB } from "~/server/db_schema/fb_schema";
import { type Location } from "~/server/db_schema/type_def";
import { Query, QueryError } from "../../queries_monad";
import { server_error } from "~/server/server_error";
import { to_location } from "~/server/validation/db_types/location_validation";

export const create_new_location: Query<{ id: string, address: string }, void> =
    async (location: { id: string, address: string }, f_db: FireDB) => {
        await set(f_db.location_entries([location.id]),location);
    }

export const retrieve_location: Query<{ id: string }, Location> =
    async ({ id }: { id: string }, f_db: FireDB): Promise<Location | QueryError> => {
        const data: DataSnapshot = await get(f_db.location_entries([id]));

        if(!data.exists()) {
            return server_error("location {".concat(id, "} does not exists"));
        }

        return to_location(data.val());
    }
