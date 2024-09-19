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
    AppointmentEntry,
    Customer,
    Technician,
} from "~/server/db_schema/type_def";
import {
    create_appointment_entry,
    delete_appointment_entry,
    retrieve_appointment_entries_on_date,
    retrieve_appointment_entry,
    update_appointment_entry,
} from "../../crud/appointment/appointment_entry";
import { Query } from "../../server_queries_monad";
import {
    create_customers_appointments_entry,
    delete_customers_appointment_entry,
    retrieve_customer_appointments_index,
} from "../../crud/appointment/customer_appointments";
import { get_all_technicians } from "../technician/technician_queries";
import { retrieve_customer_entry } from "../../crud/customer/customer_entry";
import { valiDate } from "~/server/validation/semantic/date";

export const create_new_appointment: Query<
    AppointmentCreationInfo,
    Appointment
> = async (params, f_db) => {
    const context = "Create New Appointment";
    const vali = valiDate(params.date);
    if (is_data_error(vali)) {
        return vali.stack(context, `in valid date {${params.date}}`);
    }

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
            salon: entry.salon,
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

export const retrieve_customers_appointments: Query<
    Customer,
    PartialResult<Appointment[]>
> = async (customer, f_db) => {
    const context = `retriving appointments of customer { ${customer.name} }`;

    const v: void = undefined;
    const technician_query = get_all_technicians(v, f_db);

    const index = await retrieve_customer_appointments_index(
        { customer_id: customer.id },
        f_db,
    );

    if (is_data_error(index)) return index.stack(context, "...");

    const errors: DataError[] = index.error != null ? [index.error] : [];

    const query: (
        | Promise<AppointmentEntry | DataError>
        | AppointmentEntry
        | DataError
    )[] = [];

    for (const data of index.data) {
        query.push(retrieve_appointment_entry(data, f_db));
    }

    const appointment_entries: AppointmentEntry[] = [];

    (await Promise.all(query)).map((res: AppointmentEntry | DataError) => {
        if (is_data_error(res)) {
            errors.push(res);
        } else {
            appointment_entries.push(res);
        }
    });

    const technicians = await technician_query;

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

    for (let i = 0; i < appointment_entries.length; i++) {
        const entry = appointment_entries[i];
        if (entry == undefined) continue;

        const sub_context = `filling out appointment { ${entry.id} }`;

        if (is_data_error(customer)) {
            errors.push(
                customer.stack(
                    sub_context,
                    `error retrieving customer { ${entry.customer_id} }`,
                ),
            );
            continue;
        }

        if (entry.technician_id != null) {
            const tech = tech_map[entry.technician_id];

            if (tech != undefined) {
                appointments.push({
                    ...entry,
                    technician: tech,
                    customer: customer,
                });
                continue;
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
            salon: entry.salon,
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

export const retrieve_appointments_on_date: Query<
    { date: string; salon: string },
    PartialResult<Appointment[]>
> = async ({ date, salon }, f_db) => {
    const context = `retriving appointments of { ${date} }`;

    const appointment_entries_query = retrieve_appointment_entries_on_date(
        { date: date, salon: salon },
        f_db,
    );
    const v: void = undefined;
    const technician_query = get_all_technicians(v, f_db);

    const appointment_entries = await appointment_entries_query;

    if (is_data_error(appointment_entries))
        return appointment_entries.stack(context, "...");

    const errors: DataError[] = [];

    if (appointment_entries.error != null) {
        errors.push(appointment_entries.error);
    }

    const technicians = await technician_query;

    if (is_data_error(technicians))
        return technicians.stack(context, "unable to retrieve technicians");

    if (is_data_error(technicians.error)) {
        errors.push(technicians.error);
    }

    const tech_map: { [index: string]: Technician } = {};

    technicians.data.forEach((tech) => {
        tech_map[tech.id] = tech;
    });

    const customer_entries: {
        [index: string]: Promise<Customer | DataError> | Customer | DataError;
    } = {};

    for (let i = 0; i < appointment_entries.data.length; i++) {
        const entry = appointment_entries.data[i];
        if (entry == null) {
            errors.push(data_error(context, "undefined in entry array"));
            continue;
        }

        if (customer_entries[entry.customer_id] == undefined) {
            customer_entries[entry.customer_id] = retrieve_customer_entry(
                { customer_id: entry.customer_id },
                f_db,
            );
        }
    }

    const appointments: Appointment[] = [];

    for (let i = 0; i < appointment_entries.data.length; i++) {
        const entry = appointment_entries.data[i];
        if (entry == undefined) continue;

        const sub_context = `filling out appointment { ${entry.id} }`;

        const customer = await customer_entries[entry.customer_id];

        if (is_data_error(customer)) {
            errors.push(
                customer.stack(
                    sub_context,
                    `error retrieving customer { ${entry.customer_id} }`,
                ),
            );
            continue;
        }

        if (customer == undefined) {
            errors.push(
                data_error(
                    sub_context,
                    `UNREACHABLE*! error retrieving customer { ${entry.customer_id} }`,
                ),
            );
            continue;
        }

        if (entry.technician_id != null) {
            const tech = tech_map[entry.technician_id];

            if (tech != undefined) {
                appointments.push({
                    ...entry,
                    technician: tech,
                    customer: customer,
                });
                continue;
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
            salon: entry.salon,
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

export const update_appointment: Query<Appointment, void> = async (
    appointment,
    f_db,
) => {
    const context = "update appointment";

    const updates: Record<string, unknown> = {};

    const tech = appointment.technician;
    if (tech == null) {
        updates["technician_id"] = null;
    } else {
        updates["technician_id"] = tech.id;
    }

    updates["time"] = appointment.time;
    updates["details"] = appointment.details;
    updates["duration"] = appointment.duration;

    const entry_update = await update_appointment_entry(
        {
            date: appointment.date,
            salon: appointment.salon,
            id: appointment.id,
            record: updates,
        },
        f_db,
    );

    if (is_data_error(entry_update)) return entry_update.stack(context, "...");
};

export const delete_appointment: Query<Appointment, void> = async (
    appointment,
    f_db,
) => {
    const context = `deleting appointment { ${appointment.id} }`;

    const del_entry = delete_appointment_entry(
        {
            date: appointment.date,
            salon: appointment.salon,
            id: appointment.id,
        },
        f_db,
    );

    const delete_index = delete_customers_appointment_entry(
        { customer_id: appointment.customer.id, id: appointment.id },
        f_db,
    );

    const e = await del_entry;
    if (is_data_error(e)) return e.stack(context, "failed to delete entry");

    return delete_index;
};
