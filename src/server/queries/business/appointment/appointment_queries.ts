import { is_data_error } from "~/server/data_error";
import { Appointment, AppointmentCreationInfo } from "~/server/db_schema/type_def";
import { create_appointment_entry } from "../../crud/appointment/appointment_entry";
import { Query } from "../../server_queries_monad";
import { create_customers_appointments_entry } from "../../crud/appointment/customer_appointments";

export const create_new_appointment: Query<AppointmentCreationInfo, Appointment> =
    async (params, f_db) => {
        const context = "Create New Appointment";
        const entry = await create_appointment_entry({
            ...params,
            customer_id: params.customer.id,
            technician_id: null,
        }, f_db);

        if(is_data_error(entry)) {
            return entry.stack(context, "failed creating entry");
        }

        const list = await create_customers_appointments_entry({
            customer_id: entry.customer_id,
            id: entry.id,
            date: entry.date.toString(),
        }, f_db);

        if(is_data_error(list)){
            return list.stack(context, "creating customer appointment index");
        }

        return {
            ...entry,
            technician: null,
            customer: params.customer,
        };
    }
