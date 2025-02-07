import { APPOINTMENTS_ROOT, DATES, PATH_ENTRIES } from "~/server/fire_db";
import { ServerQuery } from "~/server/server_query";
import {
    AppointmentEntry,
    AppointmentEntryCreationInfo,
    AppointmentEntryUpdateInfo,
    AppointmentID,
    AppointmentRecordID,
} from "../type_def";
import { get, push, remove, set, update } from "firebase/database";
import { DataError } from "~/server/data_error";

function appointment_entry(
    date: string,
    salon: string,
    id: string | null = null,
): string[] {
    const a = [DATES, date, APPOINTMENTS_ROOT, salon, PATH_ENTRIES];
    if (id != null) a.push(id);
    return a;
}

export const create_appointment_entry: ServerQuery<
    AppointmentEntryCreationInfo,
    AppointmentEntry
> = ServerQuery.create_query(async (params, f_db) => {
    const context = `Create appointment entry { ${params.details} }`;
    let id_ref;
    try {
        id_ref = push(
            f_db.access(appointment_entry(params.date, params.salon)),
        );
    } catch {
        console.log("push");
        return new DataError(context + " - db connection error");
    }

    if (id_ref.key == null) {
        return new DataError(
            context + " - failed to create appointment entry id",
        );
    }

    const appointment: AppointmentEntry = {
        id: id_ref.key,
        customer_id: params.customer_id,
        date: params.date,
        time: params.time,
        duration: params.duration,
        details: params.details,
        salon: params.salon,
    };

    try {
        await set(id_ref, appointment);
        return appointment;
    } catch {
        console.log("set");
        return new DataError(context + " - db connection error");
    }
});

export const retrieve_appointment_entries_on_date: ServerQuery<
    AppointmentRecordID,
    (AppointmentEntry | DataError)[]
> = ServerQuery.create_query(async ({ date, salon }, f_db) => {
    const context = `Retrieving appointments of ${date}`;

    const ref = f_db.access(appointment_entry(date, salon));
    let data;
    try {
        data = await get(ref);
    } catch {
        return new DataError(context + " - db connection error");
    }

    if (!data.exists()) {
        return [];
    }

    const appointments: (AppointmentEntry | DataError)[] = [];

    data.forEach((child) => {
        const appointment = AppointmentEntry.safeParse(child.val());
        if (appointment.success) {
            appointments.push(appointment.data);
        } else {
            appointments.push(
                new DataError(context + ` - corrupted entry ${child.val()}`),
            );
        }
    });

    return appointments;
});

export const retrieve_appointment_entry: ServerQuery<
    AppointmentID,
    AppointmentEntry
> = ServerQuery.create_query(async ({ entry_id, salon, date }, f_db) => {
    const context = `Retrieving appointment entry { ${entry_id} }`;
    let data;

    try {
        data = await get(f_db.access(appointment_entry(date, salon, entry_id)));
    } catch {
        return new DataError(context + " - db connection error");
    }

    if (!data.exists()) {
        return new DataError(context + " - entry does not exist");
    }

    const e = AppointmentEntry.safeParse(data.val());
    if (e.success) {
        return e.data;
    } else {
        return new DataError(context + " - corrupted entry");
    }
});

export const update_appointment_entry: ServerQuery<
    AppointmentEntryUpdateInfo,
    void
> = ServerQuery.create_query(
    async (
        {
            id: { entry_id, salon, date },
            technician_id,
            details,
            time,
            duration,
        },
        f_db,
    ) => {
        const record: Record<string, any> = {};
        record["/details"] = details;
        record["/time"] = time;
        record["/duration"] = duration;
        record["/technician_id"] =
            technician_id === undefined ? null : technician_id;

        try {
            await update(
                f_db.access(appointment_entry(date, salon, entry_id)),
                record,
            );
        } catch {
            return new DataError(" - db connection error");
        }
    },
);

export const delete_appointment_entry: ServerQuery<AppointmentID, void> =
    ServerQuery.create_query(async ({ entry_id, salon, date }, f_db) => {
        try {
            await remove(f_db.access(appointment_entry(date, salon, entry_id)));
        } catch {
            return new DataError(`Remove appointment entry { ${entry_id} }`);
        }
    });
