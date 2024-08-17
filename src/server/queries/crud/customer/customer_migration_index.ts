import "server-only";

import { db_query, Query } from "../../server_queries_monad";
import { is_string } from "~/server/validation/simple_type";
import { data_error, is_data_error } from "~/server/data_error";
import { get, remove, set } from "firebase/database";

export const create_customer_migration_index: Query<
    { customer_id: string; legacy_id: string },
    void
> = async ({ customer_id, legacy_id }, f_db) => {
    return db_query(
        "Creating customer migration index",
        set(f_db.customers_legacy_id_index([legacy_id]), customer_id),
    );
};

export const retrieve_customer_id_from_legacy_id: Query<
    { legacy_id: string },
    { customer_id: string | null }
> = async ({ legacy_id }, f_db) => {
    const context = "Retrieving customer id from legacy db { ".concat(
        legacy_id,
        " }",
    );

    const data = await db_query(
        context,
        get(f_db.customers_legacy_id_index([legacy_id])),
    );
    if (is_data_error(data)) return data;

    if (!data.exists()) {
        return { customer_id: null };
    }

    const result: unknown = data.val();

    if (!is_string(result)) {
        return data_error(context, "corrupted not a string");
    }

    return { customer_id: result };
};

export const delete_customer_migration_index: Query<
    { legacy_id: string },
    void
> = async ({ legacy_id }, f_db) => {
    return db_query(
        "Deleting migration index",
        remove(f_db.customers_legacy_id_index([legacy_id])),
    );
};
