import { Customer, CustomerId } from "../customer/type_def";
import { DataError, is_data_error, report_partial_errors } from "../data_error";
import { array_query, ServerQuery } from "../server_query";
import { retrieve_all_technician_entries } from "../technician/components/technician_entry";
import { Technician } from "../technician/type_def";
import { valiDate } from "../validation/date";
import {
    create_appointment_entry,
    delete_appointment_entry,
    retrieve_appointment_entries_on_date,
    retrieve_appointment_entry,
    update_appointment_entry,
} from "./component/appointment_entry";
import {
    create_customers_appointments_entry,
    delete_customers_appointment_entry,
    retrieve_customer_appointments_index,
} from "./component/customer_appointments";
import {
    AppointmentEntry,
    AppointmentCreationInfo,
    AppointmentEntryCreationInfo,
    Appointment,
    CustomerAppointmentIndex,
} from "./type_def";
import { retrieve_customer_entry } from "../customer/components/customer_entry";

export class AppointmentQuery {
    public static create_new_appointment: ServerQuery<
        AppointmentCreationInfo,
        Appointment
    > = ServerQuery.from_builder((params) =>
        ServerQuery.from_data(params.date)
            .chain(valiDate)
            .chain<AppointmentEntryCreationInfo>(() => {
                return {
                    ...params,
                    customer_id: params.customer.id,
                };
            })
            .chain<AppointmentEntry>(create_appointment_entry)
            .chain<Appointment>(
                ServerQuery.from_builder((appointment) =>
                    ServerQuery.from_data({
                        customer_id: appointment.customer_id,
                        appointment_id: appointment.id,
                        date: appointment.date,
                        salon: appointment.salon,
                    })
                        .chain(create_customers_appointments_entry)
                        .chain<Appointment>(() => {
                            return {
                                customer: params.customer,
                                date: appointment.date,
                                salon: appointment.salon,
                                time: appointment.time,
                                duration: appointment.duration,
                                details: appointment.details,
                                id: appointment.id,
                            };
                        }),
                ),
            ),
    );
    public static retrieve_customers_appointments: ServerQuery<
        Customer,
        Appointment[]
    > = ServerQuery.from_builder((customer, f_db) => {
        const v: void = undefined;
        const technicians_query = retrieve_all_technician_entries
            .chain<Technician[]>(report_partial_errors)
            .chain<Record<string, Technician>>((technicians) => {
                const rec: Record<string, Technician> = {};
                for (const technician of technicians) {
                    rec[technician.id] = technician;
                }
                return rec;
            })
            .call(v, f_db);

        return ServerQuery.create_query((customer: Customer) => {
            return { customer_id: customer.id };
        })
            .chain(retrieve_customer_appointments_index)
            .chain<CustomerAppointmentIndex[]>(report_partial_errors)
            .chain<AppointmentEntry[]>(
                array_query(
                    ServerQuery.create_query(
                        (index: CustomerAppointmentIndex) => {
                            return {
                                salon: index.salon,
                                date: index.date,
                                entry_id: index.appointment_id,
                            };
                        },
                    ).chain(retrieve_appointment_entry),
                ),
            )
            .chain<Appointment[]>(async (entries) => {
                const appointments: Appointment[] = [];
                const tech = await technicians_query;

                if (is_data_error(tech)) return tech;

                for (const entry of entries) {
                    appointments.push({
                        id: entry.id,
                        date: entry.date,
                        salon: entry.salon,
                        time: entry.time,
                        duration: entry.duration,
                        details: entry.details,
                        customer: customer,
                        technician: entry.technician_id
                            ? tech[entry.technician_id]
                            : undefined,
                    });
                }
                return appointments;
            });
    });

    public static retrieve_appointments_on_date: ServerQuery<
        { date: string; salon: string },
        Appointment[]
    > = ServerQuery.from_builder((input, f_db) => {
        const context = `retriving appointments of { ${input.date} }`;
        const v: void = undefined;
        const technicians_query = retrieve_all_technician_entries
            .chain<Technician[]>(report_partial_errors)
            .chain<Record<string, Technician>>((technicians) => {
                const rec: Record<string, Technician> = {};
                for (const technician of technicians) {
                    rec[technician.id] = technician;
                }
                return rec;
            })
            .call(v, f_db);

        return retrieve_appointment_entries_on_date
            .chain<AppointmentEntry[]>(report_partial_errors)
            .chain<(Appointment | DataError)[]>(
                ServerQuery.create_query(async (entries) => {
                    const customers = await ServerQuery.create_query(
                        (entries: CustomerId[]) => {
                            const unique: CustomerId[] = [];
                            for (const entry of entries) {
                                let found = false;
                                for (const u of unique) {
                                    if (u.customer_id === entry.customer_id) {
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) unique.push(entry);
                            }
                            return unique;
                        },
                    )
                        .chain(array_query(retrieve_customer_entry))
                        .chain<Record<string, Customer>>((customers) => {
                            const rec: Record<string, Customer> = {};
                            for (const customer of customers) {
                                rec[customer.id] = customer;
                            }
                            return rec;
                        })
                        .call(entries, f_db);

                    const tech = await technicians_query;
                    const appointments: (Appointment | DataError)[] = [];

                    if (is_data_error(customers)) return customers;
                    if (is_data_error(tech)) return tech;

                    for (const entry of entries) {
                        const customer = customers[entry.customer_id];
                        if (customer) {
                            appointments.push({
                                id: entry.id,
                                date: entry.date,
                                salon: entry.salon,
                                time: entry.time,
                                duration: entry.duration,
                                details: entry.details,
                                customer: customer,
                                technician: entry.technician_id
                                    ? tech[entry.technician_id]
                                    : undefined,
                            });
                        } else {
                            appointments.push(
                                new DataError(
                                    context + " - customer not found",
                                ),
                            );
                        }
                    }

                    return appointments;
                }),
            )
            .chain<Appointment[]>(report_partial_errors);
    });

    public static update_appointment: ServerQuery<Appointment, void> =
        ServerQuery.create_query((appointment: Appointment) => {
            return {
                id: {
                    date: appointment.date,
                    salon: appointment.salon,
                    entry_id: appointment.id,
                },
                technician_id: appointment.technician?.id,
                time: appointment.time,
                duration: appointment.duration,
                details: appointment.details,
            };
        }).chain(update_appointment_entry);

    public static delete_appointment: ServerQuery<Appointment, void> =
        ServerQuery.from_builder((appointment: Appointment) =>
            ServerQuery.create_query((appointment: Appointment) => {
                return {
                    entry_id: appointment.id,
                    salon: appointment.salon,
                    date: appointment.date,
                };
            })
                .chain(delete_appointment_entry)
                .chain<CustomerAppointmentIndex>(() => {
                    return {
                        date: appointment.date,
                        salon: appointment.salon,
                        customer_id: appointment.customer.id,
                        appointment_id: appointment.id,
                    };
                })
                .chain(delete_customers_appointment_entry),
        );
}
