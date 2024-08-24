import {
    data_error,
    DataError,
    is_data_error,
    lotta_errors,
} from "~/server/data_error";
import { Query } from "../../server_queries_monad";
import { get_all_technicians } from "../technician/technician_queries";
import { update_technician_entry } from "../../crud/technician/technician_entry";
import {
    create_technician_migration_index,
    retrieve_technician_index,
} from "../../crud/technician/technician_migration_index";

export const clone_technicians_from_prods: Query<void, void> = async (
    v,
    f_db,
) => {
    const context = "cloning technicians from production";

    if (process.env.VERCEL_ENV === "production") {
        return data_error(context, "is currently in production");
    }

    const prod_tech_query = get_all_technicians(v, f_db.prod());
    const prod_index_query = retrieve_technician_index(v, f_db.prod());
    const tech_query = get_all_technicians(v, f_db);

    const prod_tech = await prod_tech_query;
    const prod_index = await prod_index_query;
    const tech = await tech_query;

    if (is_data_error(prod_tech)) {
        return prod_tech.stack(context, "...");
    }
    if (is_data_error(tech)) {
        return tech.stack(context, "...");
    }
    if (is_data_error(prod_index)) {
        return prod_index.stack(context, "...");
    }

    if (prod_tech.error != null) {
        return prod_tech.error.stack(context, "production tech contain errors");
    }
   if (tech.error != null) {
        return tech.error.stack(context, "env technician contain error");
    }
    if (prod_index.error != null) {
        return prod_index.error.stack(context, "migration index contain error");
    }

    const updates: (Promise<void | DataError> | void | DataError)[] = [];

    prod_tech.data.forEach((prod_tec) => {
        updates.push(update_technician_entry(prod_tec, f_db));
    });

    prod_index.data.forEach((index) => {
        updates.push(create_technician_migration_index(index, f_db));
    });

    const res = await Promise.all(updates);
    const errors: DataError[] = [];

    res.forEach((e) => {
        if (is_data_error(e)) {
            errors.push(e);
        }
    });

    if (errors.length != 0) {
        return lotta_errors(context, "failed to update technician", errors);
    }
};
