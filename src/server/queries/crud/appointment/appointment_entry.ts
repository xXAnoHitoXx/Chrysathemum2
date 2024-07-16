import { AppointmentEntry } from "~/server/db_schema/type_def";
import { db_query, Query } from "../../server_queries_monad";
import { to_appointment } from "~/server/validation/db_types/appointment_validation";
import { data_error, is_data_error } from "~/server/data_error";
import { get, push, remove, set, update } from "firebase/database";

export const create_appointment_entry: Query<{
        customer_id: string,
        technician_id: string | null,
        date: number,
        time: number,
        duration: number,
        details: string,
    }, AppointmentEntry> = async (params, f_db) => {
        const context = "Create appointment entry { ".concat(params.details, " }");
        const id_ref = push(f_db.appointment_entries([]));

        if(id_ref.key == null) {
            return data_error(context, "failed to create appointment entry with null id");
        }

        const appointment: AppointmentEntry = {
            id: id_ref.key,
            customer_id: params.customer_id,
            technician_id: params.technician_id,
            date: params.date,
            time: params.time,
            duration: params.duration,
            details: params.details,
        }

        const res = await db_query(context, set(id_ref, appointment));
        if(is_data_error(res)) return res;

        return appointment;
    }

export const retrieve_appointment_entry: Query<{ id: string }, AppointmentEntry> =
    async ({ id }, f_db) => {
        const context = "Retrieving appointment entry { ".concat(id, " }");
        const data = await db_query(context, get(f_db.appointment_entries([id])));
        if(is_data_error(data)) return data;

        if(!data.exists()){
            return data_error(context, "retrieving non exist AppointmentEntry {".concat(id, "}"));
        }

        const e = to_appointment(data.val());
        if(is_data_error(e)) return e.stack(context, "corrupted entry");
        return e;
    }

export const update_appointment_entry: Query<AppointmentEntry, void> =
    async (appointment, f_db) => {
        return db_query(
            "Update AppointmentEntry Entry",
            update(f_db.appointment_entries([appointment.id]), appointment)
        );
    }

export const delete_appointment_entry : Query<{ id: string }, void> =
    async ({ id }, f_db) => {
        return db_query(
            "Remove appointment entry { ".concat(id, " }"),
            remove(f_db.appointment_entries([id]))
        )
    }
