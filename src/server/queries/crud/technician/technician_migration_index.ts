import "server-only";

import { db_query, Query } from "../../server_queries_monad";
import { is_string } from "~/server/validation/simple_type";
import { data_error, is_data_error } from "~/server/data_error";
import { get, remove, set } from "firebase/database";

export const create_technician_migration_index: Query<
    { legacy_id: string; technician_id: string },
    void
> = async ({ legacy_id, technician_id }, f_db) => {
    const ref = f_db.technician_legacy_index([legacy_id]);
    return db_query(
        "Creating Technician Migration Index",
        set(ref, technician_id),
    );
};

export const retrieve_technician_id_from_legacy_id: Query<
    { legacy_id: string },
    { technician_id: string }
> = async ({ legacy_id }, f_db) => {
    const context = "Retrieve Technician { ".concat(
        legacy_id,
        " } from Migration Index",
    );

    const data = await db_query(
        context,
        get(f_db.technician_legacy_index([legacy_id])),
    );
    if (is_data_error(data)) return data;

    if (!data.exists()) {
        return data_error(context, "there is no mapping");
    }

    const result: unknown = data.val();
    if (!is_string(result)) {
        return data_error(context, "corrupted data entry");
    }

    return { technician_id: result };
};

export const delete_technician_migration_index: Query<
    { legacy_id: string },
    void
> = async ({ legacy_id }, f_db) => {
    return db_query(
        "Deleting Migration Index",
        remove(f_db.technician_legacy_index([legacy_id])),
    );
};
