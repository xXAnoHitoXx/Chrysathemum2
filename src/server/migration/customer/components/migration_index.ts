import { get, remove, set } from "firebase/database";
import { CUSTOMER_ROOT, MIGRATION_INDEX } from "~/server/fire_db";
import { DataError } from "~/server/data_error";
import { ServerQuery } from "~/server/server_query";
import { z } from "zod";
import { LegacyCustomerIndex } from "./type_def";

function customer_migration_index(id: string | null = null): string[] {
    return id === null
        ? [CUSTOMER_ROOT, MIGRATION_INDEX]
        : [CUSTOMER_ROOT, MIGRATION_INDEX, id];
}

export const create_customer_migration_index: ServerQuery<
    LegacyCustomerIndex,
    void
> = ServerQuery.create_query(async ({ customer_id, legacy_id }, f_db) => {
    try {
        await set(
            f_db.access(customer_migration_index(legacy_id)),
            customer_id,
        );
    } catch {
        return new DataError(
            `Creating cstomer migration index ${legacy_id} : ${customer_id} - db connection error`,
        );
    }
});

export const retrieve_legacy_customer_index: ServerQuery<
    any,
    LegacyCustomerIndex[]
> = ServerQuery.create_query(async (_, f_db) => {
    const context = `Retrieving legacy index`;
    let data;

    try {
        data = await get(f_db.access(customer_migration_index()));
    } catch {
        return new DataError(context + " - db connection error");
    }

    if (!data.exists()) {
        return [];
    }

    const index = z.array(LegacyCustomerIndex).safeParse(data.val());

    if (!index.success) {
        return new DataError(context + " - parsing error");
    }

    return index.data;
});

export const retrieve_customer_id_from_legacy_id: ServerQuery<
    { legacy_id: string },
    { customer_id: string | null }
> = ServerQuery.create_query(async ({ legacy_id }, f_db) => {
    const context = `Retrieving customer id from legacy db ${legacy_id}`;

    let data;

    try {
        data = await get(f_db.access(customer_migration_index(legacy_id)));
    } catch {
        return new DataError(context + " - db connection error");
    }

    if (!data.exists()) {
        return { customer_id: null };
    }

    const result = z.string().safeParse(data.val());

    if (!result.success) {
        return new DataError(context + " - not a string");
    }

    return { customer_id: result.data };
});

export const delete_customer_migration_index: ServerQuery<
    { legacy_id: string },
    void
> = ServerQuery.create_query(async ({ legacy_id }, f_db) => {
    try {
        await remove(f_db.access(customer_migration_index(legacy_id)));
    } catch {
        return new DataError("Deleting migration index - db connection error");
    }
});
