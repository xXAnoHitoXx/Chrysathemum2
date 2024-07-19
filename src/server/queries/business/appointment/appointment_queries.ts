import {
    data_error,
    DataError,
    is_data_error,
    lotta_errors,
    PartialResult,
} from "~/server/data_error";
import {
    Appointment,
    AppointmentCreationInfo,
    Technician,
} from "~/server/db_schema/type_def";
import {
    create_appointment_entry,
    delete_appointment_entry,
    retrieve_appointment_entries_on_date,
} from "../../crud/appointment/appointment_entry";
import { db_query, Query } from "../../server_queries_monad";
import {
    create_customers_appointments_entry,
    delete_customers_appointment_entry,
} from "../../crud/appointment/customer_appointments";
import { get } from "firebase/database";
import { get_all_technicians } from "../technician/technician_queries";
import { retrieve_customer_entry } from "../../crud/customer/customer_entry";

export const create_new_appointment: Query<
    AppointmentCreationInfo,
    Appointment
> = async (params, f_db) => {
    const context = "Create New Appointment";
    const entry = await create_appointment_entry(
        {
            ...params,
            customer_id: params.customer.id,
            technician_id: null,
        },
        f_db,
    );

    if (is_data_error(entry)) {
        return entry.stack(context, "failed creating entry");
    }

    const list = await create_customers_appointments_entry(
        {
            customer_id: entry.customer_id,
            id: entry.id,
            date: entry.date.toString(),
        },
        f_db,
    );

    if (is_data_error(list)) {
        return list.stack(context, "creating customer appointment index");
    }

    return {
        ...entry,
        technician: null,
        customer: params.customer,
    };
};

export const retrieve_appointments_on_date: Query<
    { date: string },
    PartialResult<Appointment[]>
> = async ({ date }, f_db) => {
    const context = `retriving appointments of { ${date} }`;
    const data = await db_query(
        context,
        get(f_db.appointment_date_entries(date, [])),
    );
    if (is_data_error(data)) return data;

    const appointment_entries = await retrieve_appointment_entries_on_date(
        { date: date },
        f_db,
    );

    if (is_data_error(appointment_entries))
        return appointment_entries.stack(context, "...");

    const errors: DataError[] = [];

    if (appointment_entries.error != null) {
        errors.push(appointment_entries.error);
    }

    const v: void = undefined;
    const technicians = await get_all_technicians(v, f_db);

    if (is_data_error(technicians))
        return technicians.stack(context, "unable to retrieve technicians");

    if (is_data_error(technicians.error)) {
        errors.push(technicians.error);
    }

    const tech_map: { [index: string]: Technician } = {};

    technicians.data.forEach((tech) => {
        tech_map[tech.id] = tech;
    });

    const appointments: Appointment[] = [];

    for (let i = 0; i < appointment_entries.data.length; i++) {
        const entry = appointment_entries.data[i];
        if (entry == null) {
            errors.push(data_error(context, "undefined in entry array"));
            break;
        }

        const sub_context = `filling out appointment { ${entry.id} }`;

        const customer = await retrieve_customer_entry(
            { customer_id: entry.customer_id },
            f_db,
        );

        if (is_data_error(customer)) {
            errors.push(
                customer.stack(
                    sub_context,
                    `error retrieving customer { ${entry.customer_id} }`,
                ),
            );
            break;
        }

        if (entry.technician_id != null) {
            const tech = tech_map[entry.technician_id];

            if (tech != undefined) {
                appointments.push({
                    ...entry,
                    technician: tech,
                    customer: customer,
                });
                break;
            }
        }

        appointments.push({
            id: entry.id,
            date: entry.date,
            duration: entry.duration,
            details: entry.details,
            time: entry.time,
            technician: null,
            customer: customer,
        });
    }

    return {
        data: appointments,
        error:
            errors.length == 0
                ? null
                : lotta_errors(context, "encountered errors", errors),
    };
};

export const delete_appointment: Query<Appointment, void> = async (
    appointment,
    f_db,
) => {
    const context = `deleting appointment { ${appointment.id} }`;

    const e = await delete_appointment_entry(
        { date: appointment.date, id: appointment.id },
        f_db,
    );

    if (is_data_error(e)) return e.stack(context, "failed to delete entry");

    return delete_customers_appointment_entry(
        { customer_id: appointment.customer.id, id: appointment.id },
        f_db,
    );
};
