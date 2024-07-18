import {
    data_error,
    DataError,
    is_data_error,
    lotta_errors,
    PartialResult,
} from "~/server/data_error";
import { db_query, Query } from "../../server_queries_monad";
import { get, remove, set } from "firebase/database";
import { is_string } from "~/server/validation/simple_type";

export const create_customers_appointments_entry: Query<
    { customer_id: string; id: string; date: string },
    void
> = async ({ customer_id, id, date }, f_db) => {
    const context = "Creating Customer Appointment entry";

    const ref = f_db.customers_appointment_list([customer_id, id]);

    const e = await db_query(context, set(ref, date));
    if (is_data_error(e)) return e;
};

export const retrieve_customer_appointments: Query<
    { customer_id: string },
    PartialResult<{ id: string; date: string }[]>
> = async ({ customer_id }, f_db) => {
    const context = "Retrieving Appointments of Customer ".concat(customer_id);

    const ref = f_db.customers_appointment_list([customer_id]);
    const data = await db_query(context, get(ref));
    if (is_data_error(data)) return data;

    if (!data.exists()) {
        return { data: [], error: null };
    }

    const appointments: { id: string; date: string }[] = [];
    const error: DataError[] = [];

    data.forEach((child) => {
        const date = child.val();
        if (is_string(date)) {
            appointments.push({ id: child.key, date: date });
        } else {
            error.push(
                data_error(context, child.key.concat(" value is not a string")),
            );
        }
    });

    return {
        data: appointments,
        error:
            error.length == 0
                ? null
                : lotta_errors(
                      context,
                      error.length.toString().concat(" corrupted entries"),
                      error,
                  ),
    };
};

export const delete_customers_appointment_entry: Query<
    { customer_id: string; id: string },
    void
> = async ({ customer_id, id }, f_db) => {
    const ref = f_db.customers_appointment_list([customer_id, id]);
    return db_query("Remove Transaction entry", remove(ref));
};
