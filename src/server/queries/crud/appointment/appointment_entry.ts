import { AppointmentEntry } from "~/server/db_schema/type_def";
import { db_query, Query } from "../../server_queries_monad";
import { to_appointment } from "~/server/validation/db_types/appointment_validation";
import {
    data_error,
    DataError,
    is_data_error,
    lotta_errors,
    PartialResult,
} from "~/server/data_error";
import { get, push, remove, set, update } from "firebase/database";
import {
    PATH_APPOINTMENTS,
    PATH_DATES,
    PATH_ENTRIES,
} from "~/server/db_schema/fb_schema";

function appointment_entry(date: string, id: string | null = null): string[] {
    const a = [PATH_DATES, date, PATH_APPOINTMENTS, PATH_ENTRIES];
    if (id != null) a.push(id);
    return a;
}

export const create_appointment_entry: Query<
    {
        customer_id: string;
        technician_id: string | null;
        date: string;
        time: number;
        duration: number;
        details: string;
        salon: string;
    },
    AppointmentEntry
> = async (params, f_db) => {
    const context = "Create appointment entry { ".concat(params.details, " }");
    const id_ref = push(f_db.access(appointment_entry(params.date)));

    if (id_ref.key == null) {
        return data_error(
            context,
            "failed to create appointment entry with null id",
        );
    }

    const appointment: AppointmentEntry = {
        id: id_ref.key,
        customer_id: params.customer_id,
        technician_id: params.technician_id,
        date: params.date,
        time: params.time,
        duration: params.duration,
        details: params.details,
        salon: params.salon,
    };

    const res = await db_query(context, set(id_ref, appointment));
    if (is_data_error(res)) return res;

    return appointment;
};

export const retrieve_appointment_entries_on_date: Query<
    { date: string },
    PartialResult<AppointmentEntry[]>
> = async ({ date }, f_db) => {
    const context = "Retrieving appointments of ".concat(date);

    const ref = f_db.access(appointment_entry(date));
    const data = await db_query(context, get(ref));
    if (is_data_error(data)) return data;

    if (!data.exists()) {
        return { data: [], error: null };
    }

    const appointments: AppointmentEntry[] = [];
    const error: DataError[] = [];

    data.forEach((child) => {
        const appointment = to_appointment(child.val());
        if (is_data_error(appointment)) {
            error.push(
                appointment.stack(
                    "Parsing { ".concat(child.key, " }"),
                    "corrupted entry",
                ),
            );
            return;
        }
        appointments.push(appointment);
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

export const retrieve_appointment_entry: Query<
    { id: string; date: string },
    AppointmentEntry
> = async ({ id, date }, f_db) => {
    const context = "Retrieving appointment entry { ".concat(id, " }");
    const data = await db_query(
        context,
        get(f_db.access(appointment_entry(date, id))),
    );
    if (is_data_error(data)) return data;

    if (!data.exists()) {
        return data_error(
            context,
            "retrieving non existing AppointmentEntry {".concat(id, "}"),
        );
    }

    const e = to_appointment(data.val());
    if (is_data_error(e)) return e.stack(context, "corrupted entry");
    return e;
};

export const update_appointment_entry: Query<AppointmentEntry, void> = async (
    appointment,
    f_db,
) => {
    return db_query(
        "Update AppointmentEntry Entry",
        update(
            f_db.access(appointment_entry(appointment.date, appointment.id)),
            appointment,
        ),
    );
};

export const delete_appointment_entry: Query<
    { date: string; id: string },
    void
> = async ({ id, date }, f_db) => {
    return db_query(
        "Remove appointment entry { ".concat(id, " }"),
        remove(f_db.access(appointment_entry(date, id))),
    );
};
