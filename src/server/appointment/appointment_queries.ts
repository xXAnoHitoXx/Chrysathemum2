import { Customer, CustomerId } from "../customer/type_def";
import { DataError, is_data_error, report_partial_errors } from "../data_error";
import { array_query, ServerQuery } from "../server_query";
import { retrieve_all_technician_entries } from "../technician/components/technician_entry";
import { Technician } from "../technician/type_def";
import { z } from "zod";
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
    AppointmentUpdate,
} from "./type_def";
import { retrieve_customer_entry } from "../customer/components/customer_entry";

export class AppointmentQuery {
    public static create_new_appointment: ServerQuery<
        AppointmentCreationInfo,
        Appointment
    > = ServerQuery.from_builder((params) =>
        ServerQuery.from_data(params.date)
            .chain<string>((date) => {
                const validate = z.string().date().safeParse(date);
                if (validate.success) {
                    return validate.data;
                } else {
                    return new DataError("not a date");
                }
            })
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
            .chain<(CustomerAppointmentIndex | DataError)[]>(
                retrieve_customer_appointments_index,
            )
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
                    ).chain<AppointmentEntry>(retrieve_appointment_entry),
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
        const technicians_query = retrieve_all_technician_entries
            .chain<Technician[]>(report_partial_errors)
            .chain<Record<string, Technician>>((technicians) => {
                const rec: Record<string, Technician> = {};
                for (const technician of technicians) {
                    rec[technician.id] = technician;
                }
                return rec;
            })
            .call(undefined as void, f_db);

        return retrieve_appointment_entries_on_date
            .chain<AppointmentEntry[]>(report_partial_errors)
            .chain<(Appointment | DataError)[]>(
                ServerQuery.create_query(
                    async (entries: AppointmentEntry[]) => {
                        const customers = await ServerQuery.create_query(
                            (entries: CustomerId[]) => {
                                const unique: CustomerId[] = [];
                                for (const entry of entries) {
                                    let found = false;
                                    for (const u of unique) {
                                        if (
                                            u.customer_id === entry.customer_id
                                        ) {
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
                    },
                ),
            )
            .chain<Appointment[]>(report_partial_errors);
    });

    public static update_appointment: ServerQuery<AppointmentUpdate, void> =
        ServerQuery.from_builder((update) => {
            if (update.new_date === update.appointment.date) {
                return ServerQuery.create_query((update: AppointmentUpdate) => {
                    return {
                        id: {
                            date: update.appointment.date,
                            salon: update.appointment.salon,
                            entry_id: update.appointment.id,
                        },
                        technician_id: update.appointment.technician?.id,
                        time: update.appointment.time,
                        duration: update.appointment.duration,
                        details: update.appointment.details,
                    };
                }).chain(update_appointment_entry);
            } else {
                return ServerQuery.create_query((update: AppointmentUpdate) => {
                    return update.appointment;
                })
                    .chain(AppointmentQuery.delete_appointment)
                    .chain<AppointmentCreationInfo>(() => {
                        return {
                            ...update.appointment,
                            date: update.new_date,
                        };
                    })
                    .chain<Appointment>(AppointmentQuery.create_new_appointment)
                    .chain<void>(
                        update.appointment.technician === undefined
                            ? () => {}
                            : ServerQuery.create_query(
                                  (appointment: Appointment) => {
                                      return {
                                          id: {
                                              date: appointment.date,
                                              salon: appointment.salon,
                                              entry_id: appointment.id,
                                          },
                                          technician_id:
                                              update.appointment.technician?.id,
                                          time: appointment.time,
                                          duration: appointment.duration,
                                          details: appointment.details,
                                      };
                                  },
                              ).chain(update_appointment_entry),
                    );
            }
        });

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
