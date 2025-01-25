import { APPOINTMENTS_ROOT, CUSTOMER_ROOT } from "~/_server/fire_db";
import { ServerQuery } from "~/_server/server_query";
import { AppointmentRecordID, CustomerAppointmentIndex } from "../type_def";
import { get, remove, set } from "firebase/database";
import { DataError } from "~/_server/data_error";
import { CustomerId } from "~/_server/customer/type_def";
import { z } from "zod";

function customers_appointment_list(
    customer_id: string,
    appointment_id: string | null = null,
): string[] {
    return appointment_id === null
        ? [CUSTOMER_ROOT, APPOINTMENTS_ROOT, customer_id]
        : [CUSTOMER_ROOT, APPOINTMENTS_ROOT, customer_id, appointment_id];
}

export const create_customers_appointments_entry: ServerQuery<
    CustomerAppointmentIndex,
    void
> = ServerQuery.create_query(
    async ({ customer_id, appointment_id, date, salon }, f_db) => {
        const context = `Creating Customer Appointment Index for ${appointment_id}`;

        const ref = f_db.access(
            customers_appointment_list(customer_id, appointment_id),
        );

        try {
            set(ref, { date: date, salon: salon });
        } catch {
            return new DataError(context + " - db write error");
        }
    },
);

export const retrieve_customer_appointments_index: ServerQuery<
    CustomerId,
    (CustomerAppointmentIndex | DataError)[]
> = ServerQuery.create_query(async ({ customer_id }, f_db) => {
    const context = `Retrieving Appointments of Customer ${customer_id}`;

    const ref = f_db.access(customers_appointment_list(customer_id));
    let data;

    try {
        data = await get(ref);
    } catch {
        return new DataError(context + " - db connection error");
    }

    if (!data.exists()) {
        return [];
    }

    const appointments: (CustomerAppointmentIndex | DataError)[] = [];

    data.forEach((child) => {
        const appointment_id = z.string().parse(child.key);
        const data = AppointmentRecordID.safeParse(child.val());

        if (data.success) {
            appointments.push({
                ...data.data,
                appointment_id: appointment_id,
                customer_id: customer_id,
            });
        } else {
            appointments.push(
                new DataError(context + ` - corrupted entry ${appointment_id}`),
            );
        }
    });

    return appointments;
});

export const delete_customers_appointment_entry: ServerQuery<
    CustomerAppointmentIndex,
    void
> = ServerQuery.create_query(async ({ customer_id, appointment_id }, f_db) => {
    const ref = f_db.access(
        customers_appointment_list(customer_id, appointment_id),
    );
    try {
        await remove(ref);
    } catch {
        return new DataError("Remove Transaction entry - db error");
    }
});
