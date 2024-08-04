import { get, increment, set, update } from "firebase/database";
import { db_query, Query } from "../../server_queries_monad";
import {
    PATH_APPOINTMENTS,
    PATH_DATES,
    PATH_UPDATE_COUNT,
} from "~/server/db_schema/fb_schema";
import { data_error, is_data_error } from "~/server/data_error";
import { is_number } from "~/server/validation/simple_type";

function update_count(date: string): string[] {
    return [PATH_DATES, date, PATH_APPOINTMENTS, PATH_UPDATE_COUNT];
}

export const appointment_update_count_increment: Query<string, void> = async (
    date,
    f_db,
) => {
    const context = `Increment Appointment update count of date {${date}}`;
    const data = await db_query(context, get(f_db.access(update_count(date))));

    if (is_data_error(data)) return data;
    if (data.val() == null)
        return db_query(context, set(f_db.access(update_count(date)), 1));

    const updates: Record<string, unknown> = {};

    updates[PATH_UPDATE_COUNT + "/"] = increment(1);

    return db_query(
        context,
        update(f_db.access([PATH_DATES, date, PATH_APPOINTMENTS]), updates),
    );
};

export const retrieve_appointment_update_count_of_date: Query<
    string,
    number
> = async (date, f_db) => {
    const context = `Retrieve appointment update count of date {${date}}`;
    const data = await db_query(context, get(f_db.access(update_count(date))));

    if (is_data_error(data)) return data;
    const v = data.val();
    if (v == null) return 0;
    if (is_number(v)) return v;
    return data_error(context, `unknown value {${v}}`);
};
