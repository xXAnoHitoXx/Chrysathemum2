"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Method } from "~/app/api/api_query";
import { useQuery } from "@tanstack/react-query";
import { LastCustomerSave } from "../_components/customer_search";
import { AppViewActivity } from "../_components/app_view_page";
import { Appointment } from "~/server/appointment/type_def";
import { z } from "zod";
import { current_date } from "~/util/date";
import { Technician } from "~/server/technician/type_def";
import { AppointmentClosingData } from "~/server/transaction/type_def";
import { MainTask } from "./_appointment_view/tasks/main";
import { BookingTask } from "./_appointment_view/tasks/booking";
import { EditTask } from "./_appointment_view/tasks/edit";

export type AppointmentViewSaveState = {
    data: Appointment[];
};

export const appointment_view_default_save: AppointmentViewSaveState = {
    data: [],
};

enum State {
    Main = "Main",
    Booking = "Booking",
    AppEdit = "Edit",
    Closing = "Closing",
}

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
    const [current_state, set_state] = useState(State.Main);
    const [date, set_date] = useState(current_date());
    const [appointments, set_appointments] = useAppointmentList(
        props.save_state,
        save_current_state,
        date.toString(),
    );

    const [changes, set_changes] = useState<Appointment[]>([]); const [technicians, set_tech] = useState<Technician[]>([]);

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
            if (current_state !== State.AppEdit) return;

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

        static async update_appointments(appointments: Appointment[]) {
            if (appointments.length === 0) return;

            const app = appointments[0];
            if (app != undefined) props.last_customer_save.data = app.customer;

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
                    apply_edit={() => {}}
                    switch_to_closing={() =>
                        set_appointment_holder({
                            appointment: appointment_holder.appointment,
                            edit_mode: false,
                        })
                    }
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
            date={date}
            set_date={set_date}
            edit_appointment={(app) =>
                set_appointment_holder({
                    appointment: app,
                    edit_mode: true,
                })
            }
            book_appointment_at={set_booking_time}
        />
    );

    /*
    return (
        <div className="flex h-full w-full flex-1 flex-col overflow-y-auto">
            {current_state !== State.Default && !is_loading ? (
                <div
                    className={ "flex h-fit w-full justify-start" } >
                    { current_state === State.AppEdit ? (
                        <AppEdit
                            technicians={technicians}
                            appointments={phantoms}
                            date={date.toString()}
                            on_deselect={(appointment) => {
                                set_phantoms([
                                    ...phantoms.filter(
                                        (app) => app.id !== appointment.id,
                                    ),
                                ]);
                                set_appointments([
                                    ...appointments,
                                    appointment,
                                ]);
                            }}
                            on_change={trigger_redraw}
                        />
                    ) : current_state === State.Closing &&
                      phantoms[0] != undefined ? (
                        <ClosingTask
                            appointment={phantoms[0]}
                            on_change={trigger_redraw}
                            on_update={closing_update}
                            on_close={AppViewQuery.close_appointment}
                        />
                    ) : null}
                </div>
            ) : null}
            <div
                className={
                    "flex" +
                    " " +
                    (current_state === State.Default ? "h-full" : "h-2/3") +
                    " " +
                    "w-full flex-col justify-start gap-2 p-2"
                }
            >
                {
                <div className="m-1 flex h-fit w-full flex-row-reverse border-t-2 border-t-sky-900 p-1">
                    <div className="flex w-1/4 flex-row-reverse gap-10">
                        {current_state === State.AppEdit ? (
                            <>
                                <Button
                                    color="primary"
                                    isLoading={is_loading}
                                    onPress={app_edit_confirm}
                                >
                                    Confirm
                                </Button>
                                <Button
                                    color="danger"
                                    isLoading={is_loading}
                                    onPress={AppViewQuery.delete_appointments}
                                >
                                    Delete
                                </Button>
                            </>
                        ) : null}
                        {current_state !== State.Default ? (
                            <Button
                                color="danger"
                                isLoading={is_loading}
                                onPress={
                                    current_state === State.Booking
                                        ? switch_to_main_task
                                        : () => {
                                              AppViewQuery.reload_appointments();
                                              switch_to_main_task();
                                          }
                                }
                            >
                                Cancel
                            </Button>
                        ) : null}
                    </div>
                    {current_state === State.Booking &&
                    phantoms.length === 0 ? null : (
                        <BoardDatePicker date={date} set_date={set_date} />
                    )}
                </div>

                {current_state === State.Booking &&
                phantoms.length === 0 ? null : (
                    <Board
                        appointments={[...appointments, ...phantoms]}
                        on_appoitment_select={
                            current_state === State.Default ||
                            current_state === State.Closing
                                ? (appointment) => {
                                      if (is_loading) return;
                                      if (phantoms.includes(appointment)) {
                                          set_changes([appointment]);
                                          set_state(State.AppEdit);
                                      } else {
                                          if (phantoms.length != 0) {
                                              set_appointments([
                                                  ...appointments.filter(
                                                      (app) =>
                                                          app.id !==
                                                          appointment.id,
                                                  ),
                                                  ...phantoms,
                                              ]);
                                          } else {
                                              set_appointments([
                                                  ...appointments.filter(
                                                      (app) =>
                                                          app.id !==
                                                          appointment.id,
                                                  ),
                                              ]);
                                          }

                                          set_phantoms([appointment]);
                                          if (
                                              appointment.technician ===
                                              undefined
                                          ) {
                                              set_changes([appointment]);
                                              set_state(State.AppEdit);
                                          } else set_state(State.Closing);
                                      }
                                  }
                                : current_state === State.AppEdit
                                  ? (appointment) => {
                                        if (is_loading) return;
                                        if (phantoms.includes(appointment)) {
                                            set_appointments([
                                                ...appointments,
                                                ...phantoms.filter(
                                                    (app) =>
                                                        app.id !==
                                                        appointment.id,
                                                ),
                                            ]);
                                            set_phantoms([appointment]);
                                            return;
                                        }
                                        set_phantoms([
                                            ...phantoms,
                                            appointment,
                                        ]);
                                        set_changes([...changes, appointment]);
                                        set_appointments([
                                            ...appointments.filter(
                                                (app) =>
                                                    app.id.localeCompare(
                                                        appointment.id,
                                                    ) !== 0,
                                            ),
                                        ]);
                                        set_state(State.AppEdit);
                                    }
                                  : () => {}
                        }
                        on_time_stamp={(time) => {
                            if (current_state === State.Default) {
                                if (is_loading) return;
                                set_start_time(time);
                                set_state(State.Booking);
                                return;
                            }

                            if (current_state === State.Booking) {
                                for (let i = 0; i < phantoms.length; i++) {
                                    const app = phantoms[i];
                                    if (app != undefined) {
                                        app.time = to_1_index(
                                            (time - BOARD_STARTING_HOUR) *
                                                TIME_INTERVALS_PER_HOUR,
                                        );
                                    }
                                }
                                set_phantoms([...phantoms]);
                            }
                        }}
                    />
                )}
            </div>
        </div>
    );
    */
}
