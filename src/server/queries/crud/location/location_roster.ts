import { db_query, Query } from "../../server_queries_monad";
import { is_string } from "~/server/validation/simple_type";
import { DEFAULT_VALUE } from "~/server/db_schema/type_def";
import { is_data_error } from "~/server/data_error";
import { get, remove, set } from "firebase/database";

export const assign_technician_to_roster: Query<
    {
        location_id: string;
        technician: { technician_id: string; color: string };
    },
    void
> = async ({ location_id, technician }, f_db) => {
    return db_query(
        "assigning technician { ".concat(
            technician.technician_id,
            " } to { ",
            location_id,
            " }",
        ),
        set(
            f_db.location_roster([location_id, technician.technician_id]),
            technician.color,
        ),
    );
};

export const retrieve_roster: Query<
    { location_id: string },
    { technician_id: string; color: string }[]
> = async ({ location_id }, f_db) => {
    const context = "Retrieving Roster { ".concat(location_id);

    const data = await db_query(
        context,
        get(f_db.location_roster([location_id])),
    );
    if (is_data_error(data)) return data;

    const roster: { technician_id: string; color: string }[] = [];

    if (data.exists()) {
        data.forEach((child) => {
            const color = child.val();
            if (is_string(color)) {
                roster.push({
                    technician_id: child.key,
                    color: color,
                });
            } else {
                roster.push({
                    technician_id: child.key,
                    color: DEFAULT_VALUE,
                });
            }
        });
    }

    return roster;
};

export const remove_technician_from_roster: Query<
    { location_id: string; technician_id: string },
    void
> = async ({ location_id, technician_id }, f_db) => {
    return db_query(
        "Removing technician { ".concat(
            technician_id,
            " } from roster { ",
            location_id,
            " }",
        ),
        remove(f_db.location_roster([location_id, technician_id])),
    );
};
