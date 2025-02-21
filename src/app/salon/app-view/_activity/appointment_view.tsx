"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Method } from "~/app/api/api_query";
import { useQuery } from "@tanstack/react-query";
import { LastCustomerSave } from "../_components/customer_search";
import { AppViewActivity } from "../_components/app_view_page";
import { Appointment, AppointmentUpdate } from "~/server/appointment/type_def";
import { z } from "zod";
import { current_date } from "~/util/date";
import { Technician } from "~/server/technician/type_def";
import { AppointmentClosingData } from "~/server/transaction/type_def";
import { MainTask } from "./_appointment_view/tasks/main";
import { BookingTask } from "./_appointment_view/tasks/booking";
import { EditTask } from "./_appointment_view/tasks/edit";
import { ClosingTask } from "./_appointment_view/tasks/closing";

export type AppointmentViewSaveState = {
    data: Appointment[];
};

export const appointment_view_default_save: AppointmentViewSaveState = {
    data: [],
};

const app_view_appointment = "/api/app_view/appointment/";

const useAppointmentList = (
    saved_list: AppointmentViewSaveState,
    save_current_state: (save: Appointment[]) => void,
    date: string,
): [Appointment[], Dispatch<SetStateAction<Appointment[]>>] => {
    const [appointments, set_appointments] = useState<Appointment[]>(
        saved_list.data,
    );

    useQuery({
        queryFn: async () => {
            const response = await fetch(app_view_appointment + date, {
                method: Method.GET,
                cache: "no-store",
            });

            if (response.status === 200) {
                const appointments = z
                    .array(Appointment)
                    .safeParse(await response.json());

                if (appointments.success) {
                    save_current_state(appointments.data);
                    set_appointments(appointments.data);
                    return appointments.data;
                } else {
                }
            }
        },
        queryKey: ["appointment_list", date],
    });

    return [appointments, set_appointments];
};

export function AppointmentView(props: {
    set_activity: Dispatch<SetStateAction<AppViewActivity>>;
    save_state: AppointmentViewSaveState;
    last_customer_save: LastCustomerSave;
    admin: boolean;
}) {
    // save without rerender
    function save_current_state(appointments: Appointment[]) {
        props.save_state.data = appointments;
    }

    // general
    const [date, set_date] = useState(current_date());
    const [appointments, set_appointments] = useAppointmentList(
        props.save_state,
        save_current_state,
        date.toString(),
    );

    const [technicians, set_tech] = useState<Technician[]>([]);

    useQuery({
        queryFn: async () => {
            const response = await fetch("/api/technician/location", {
                method: Method.GET,
                cache: "no-cache",
            });

            if (response.status === 200) {
                const technicians = z
                    .array(Technician)
                    .safeParse(await response.json());

                if (technicians.success) {
                    set_tech(technicians.data);
                }
            }
            return true;
        },
        queryKey: ["technicians"],
        staleTime: 300000,
    });

    class AppViewQuery {
        static async book_appointments(apps: Appointment[]) {
            const response = await fetch(
                app_view_appointment + date.toString(),
                {
                    method: Method.POST,
                    body: JSON.stringify(
                        apps.map((appointment) => ({
                            customer: appointment.customer,
                            date: date.toString(),
                            time: appointment.time,
                            duration: appointment.duration,
                            details: appointment.details,
                            salon: "",
                        })),
                    ),
                },
            );

            if (response.status === 200) {
                const appointments = z
                    .array(Appointment)
                    .safeParse(await response.json());

                if (appointments.success) {
                    if (
                        appointments.data.length > 0 &&
                        appointments.data[0] != undefined &&
                        appointments.data[0].date === current_date().toString()
                    ) {
                        save_current_state(appointments.data);
                    }
                    set_appointments(appointments.data);
                }
            } else {
                AppViewQuery.reload_appointments();
            }

            switch_to_main_task();
        }

        static async reload_appointments() {
            const response = await fetch(app_view_appointment + date, {
                method: Method.GET,
                cache: "no-store",
            });
            if (response.status === 200) {
                const appointments = z
                    .array(Appointment)
                    .safeParse(await response.json());

                if (appointments.success) {
                    if (
                        appointments.data.length > 0 &&
                        appointments.data[0] != undefined &&
                        appointments.data[0].date === current_date().toString()
                    ) {
                        save_current_state(appointments.data);
                    }
                    set_appointments(appointments.data);
                }
            }
        }

        static async delete_appointments(apps: Appointment[]) {
            set_appointments((prev) => 
                prev.filter((app) => 
                    apps.reduce((b, deleted) => b || deleted.id === app.id),
                    false
            ));
            const app = apps[0];
            if (app != undefined) props.last_customer_save.data = app.customer;

            const response = await fetch(app_view_appointment + date, {
                method: Method.DELETE,
                cache: "no-cache",
                body: JSON.stringify(apps),
            });

            if (response.status === 200) {
                const appointments = z
                    .array(Appointment)
                    .safeParse(await response.json());

                if (appointments.success) {
                    if (
                        appointments.data.length > 0 &&
                        appointments.data[0] != undefined &&
                        appointments.data[0].date === current_date().toString()
                    ) {
                        save_current_state(appointments.data);
                    }
                    set_appointments(appointments.data);
                }
            } else {
                AppViewQuery.reload_appointments();
            }

            switch_to_main_task();
        }

        static async update_appointments(appointments: AppointmentUpdate[]) {
            set_appointments((prev) => prev.map((app) => {
                for (const update of appointments) {
                    if (update.appointment.id === app.id) {
                        return {
                            ...update.appointment,
                            date: update.new_date,
                        };
                    }
                }
                return app;
            }))

            if (appointments.length === 0) return;

            const app = appointments[0];
            if (app != undefined)
                props.last_customer_save.data = app.appointment.customer;

            const response = await fetch(app_view_appointment + date, {
                method: Method.PATCH,
                cache: "no-store",
                body: JSON.stringify(appointments),
            });

            if (response.status === 200) {
                const appointments = z
                    .array(Appointment)
                    .safeParse(await response.json());

                if (appointments.success) {
                    if (
                        appointments.data.length > 0 &&
                        appointments.data[0] != undefined &&
                        appointments.data[0].date === current_date().toString()
                    ) {
                        save_current_state(appointments.data);
                    }
                    set_appointments(appointments.data);
                }
            } else {
                AppViewQuery.reload_appointments();
            }

            switch_to_main_task();
        }

        static async close_appointment(data: AppointmentClosingData) {
            props.last_customer_save.data = data.appointment.customer;
            set_appointments((app) => app.filter((app) => app.id !== data.appointment.id))

            const response = await fetch(app_view_appointment + date, {
                method: Method.PUT,
                cache: "no-cache",
                body: JSON.stringify(data),
            });

            if (response.status === 200) {
                const appointments = z
                    .array(Appointment)
                    .safeParse(await response.json());

                if (appointments.success) {
                    if (
                        appointments.data.length > 0 &&
                        appointments.data[0] != undefined &&
                        appointments.data[0].date === current_date().toString()
                    ) {
                        save_current_state(appointments.data);
                    }
                    set_appointments(appointments.data);
                }
            } else {
                AppViewQuery.reload_appointments();
            }

            switch_to_main_task();
        }
    }

    const [appointment_holder, set_appointment_holder] = useState<{
        appointment: Appointment;
        edit_mode: boolean;
    } | null>(null);

    const [booking_time, set_booking_time] = useState<number | null>(null);

    function switch_to_main_task() {
        set_appointment_holder(null);
        set_booking_time(null);
    }

    if (appointment_holder !== null) {
        if (appointment_holder.edit_mode) {
            return (
                <EditTask
                    appointments={appointments}
                    date={date}
                    set_date={set_date}
                    technicians={technicians}
                    initial_app={appointment_holder.appointment}
                    on_cancel={switch_to_main_task}
                    apply_edit={(
                        updates: AppointmentUpdate[],
                        deletes: Appointment[],
                    ) => {
                        if (updates.length > 0)
                            AppViewQuery.update_appointments(updates);
                        if (deletes.length > 0)
                            AppViewQuery.delete_appointments(deletes);
                    }}
                />
            );
        } else {
            return (
                <ClosingTask
                    appointment={appointment_holder.appointment}
                    appointments={appointments}
                    date={date}
                    set_date={set_date}
                    to_edit_mode={()=>{
                        set_appointment_holder((holder) => {
                            if (holder === null) {
                                return null;
                            }

                            return {
                                appointment: holder.appointment,
                                edit_mode: true,
                            }
                        })
                    }}
                    on_close={AppViewQuery.close_appointment}
                    on_cancel={switch_to_main_task}
                />
            );
        }
    }

    if (booking_time !== null) {
        return (
            <BookingTask
                appointments={appointments}
                date={date}
                set_date={set_date}
                save={props.last_customer_save}
                hour={booking_time}
                on_book={AppViewQuery.book_appointments}
                on_cancel={switch_to_main_task}
            />
        );
    }

    return (
        <MainTask
            is_admin={props.admin}
            set_activity={props.set_activity}
            appointments={appointments}
            set_appointments={set_appointments}
            date={date}
            set_date={set_date}
            edit_appointment={(app, edit_mode) =>
                set_appointment_holder({
                    appointment: app,
                    edit_mode: edit_mode,
                })
            }
            book_appointment_at={set_booking_time}
        />
    );
}
