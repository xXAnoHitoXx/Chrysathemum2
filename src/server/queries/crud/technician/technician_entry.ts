import "server-only";

import { Technician } from "~/server/db_schema/type_def";
import { db_query, Query } from "../../server_queries_monad";
import { to_technician } from "~/server/validation/db_types/technician_validation";
import { data_error, is_data_error } from "~/server/data_error";
import { get, push, remove, set, update } from "firebase/database";

export const create_technician_entry: Query<
    { name: string; color: string; active: boolean },
    Technician
> = async (params, f_db) => {
    const context = "Creating Technician entry { ".concat(params.name, " }");
    const id_ref = push(f_db.technician_entries([]));

    if (id_ref.key == null) {
        return data_error(context, "failed to create technician_entry null id");
    }

    const technician_entry: Technician = {
        id: id_ref.key,
        ...params,
    };

    const e = await db_query(context, set(id_ref, technician_entry));
    if (is_data_error(e)) return e;

    return technician_entry;
};

export const retrieve_technician_entry: Query<
    { id: string },
    Technician
> = async ({ id }, f_db) => {
    const context = "Retrieve Technician entry { ".concat(id, " }");
    const data = await db_query(context, get(f_db.technician_entries([id])));
    if (is_data_error(data)) return data;

    if (!data.exists()) {
        return data_error(context, "entry doesn't exist");
    }

    const e = to_technician(data.val());
    if (is_data_error(e)) return e.stack(context, "corrupted entry");

    return e;
};

export const update_technician_entry: Query<Technician, void> = async (
    technician,
    f_db,
) => {
    return db_query(
        "Updating Technician entry",
        update(f_db.technician_entries([technician.id]), {
            name: technician.name,
            color: technician.color,
            active: technician.active,
        }),
    );
};

export const delete_technician_entry: Query<{ id: string }, void> = async (
    { id },
    f_db,
) => {
    await db_query(
        "Deleting Technician entry { ".concat(id, " }"),
        remove(f_db.technician_entries([id])),
    );
};
