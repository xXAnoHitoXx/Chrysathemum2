import { Appointment } from "~/server/db_schema/type_def";
import { Query } from "../../server_queries_monad";
import { DataSnapshot, DatabaseReference, get, push, remove, set, update } from "firebase/database";
import { server_error } from "~/server/server_error";
import { to_appointment } from "~/server/validation/db_types/appointment_validation";

export const create_appointment_entry: Query<{
        customer_id: string,
        technician_id: string | null,
        date: string,
        time: string,
        duration: string,
        details: string,
    }, Appointment> = async (params, f_db) => {
        const id_ref: DatabaseReference = await push(f_db.appointment_entries([]));

        if(id_ref.key == null) {
            return server_error("failed to create appointment entry with null id");
        }

        const appointment: Appointment = {
            id: id_ref.key,
            customer_id: params.customer_id,
            technician_id: params.technician_id,
            date: params.date,
            time: params.time,
            duration: params.duration,
            details: params.details,
        }

        await set(id_ref, appointment);
        return appointment;
    }

export const retrieve_appointment_entry: Query<{ id: string }, Appointment> =
    async ({ id }, f_db) => {
        const data: DataSnapshot = await get(f_db.appointment_entries([id]));

        if(!data.exists()){
            return server_error("retrieving non exist Appointment {".concat(id, "}"));
        }

        return to_appointment(data.val());
    }

export const update_appointment_entry: Query<Appointment, void> =
    async (appointment, f_db) => {
        await update(f_db.appointment_entries([appointment.id]), appointment);
    }

export const delete_appointment_entry : Query<{ id: string }, void> =
    async (params: { id : string }, f_db) => {
        await remove(f_db.appointment_entries([params.id]));
    }
