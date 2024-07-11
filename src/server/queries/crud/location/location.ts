import { Location } from "~/server/db_schema/type_def";
import { db_query, Query } from "../../server_queries_monad";
import { to_location } from "~/server/validation/db_types/location_validation";
import { data_error, is_data_error } from "~/server/data_error";
import { get, set } from "firebase/database";

export const create_new_location: Query<{ id: string, address: string }, void> =
    async (location, f_db) => {
        return db_query(
            "Creating New Location",
            set(f_db.location_entries([location.id]), location)
        );
    }

export const retrieve_location: Query<{ id: string }, Location> =
    async ({ id }, f_db) => {
        const context = "Retrieve Location entry { ".concat(id, " }")

        const data = await db_query(context, get(f_db.location_entries([id])));
        if (is_data_error(data)) return data;

        if(!data.exists()) {
            return data_error( context, "location doesn't exists" );
        }

        const e = to_location(data.val());
        if(is_data_error(e)) return e.stack( context, "corrupted entry");
        return e;
    }
