"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Method } from "~/app/api/api_query";
import { BoardDatePicker } from "../_components/date_picker";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@heroui/button";
import { Booking } from "./_appointment_view/booking_form";
import { AppEdit } from "./_appointment_view/app_edit";
import { Board } from "./_appointment_view/board";
import { LastCustomerSave } from "../_components/customer_search";
import { ClosingTask } from "./_appointment_view/closing";
import { AppViewActivity } from "../_components/app_view_page";
import { Appointment } from "~/server/appointment/type_def";
import { z } from "zod";
import { current_date } from "~/util/date";
import { Technician } from "~/server/technician/type_def";
import { Account, Closing } from "~/server/transaction/type_def";
import {
    BOARD_STARTING_HOUR,
    TIME_INTERVALS_PER_HOUR,
    to_1_index,
} from "~/util/appointment_time";

export type AppointmentViewSaveState = {
    data: Appointment[];
};

export const appointment_view_default_save: AppointmentViewSaveState = {
    data: [],
};

enum State {
    Default = "Default",
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
    const [current_state, set_state] = useState(State.Default);
    const [date, set_date] = useState(current_date());
    const [appointments, set_appointments] = useAppointmentList(
        props.save_state,
        save_current_state,
        date.toString(),
    );

    const [phantoms, set_phantoms] = useState<Appointment[]>([]);
    const [changes, set_changes] = useState<Appointment[]>([]);
    const [start_time, set_start_time] = useState(1);

    const [is_loading, set_is_loading] = useState(false);

    const [technicians, set_tech] = useState<Technician[]>([]);

    useQuery({
        queryFn: async () => {
            const response = await fetch("/api/technician/location", {
                method: Method.GET,
                cache: "no-cache",
            });

            console.log("here")
            if (response.status === 200) {
                const technicians = z
                    .array(Technician)
                    .safeParse(await response.json());

                if (technicians.success) {
                    console.log(">>>")
                    set_tech(technicians.data);
                }
            }
            console.log("done")
            return true;
        },
        queryKey: ["technicians"],
        staleTime: 300000,
    });

    async function book_appointments() {
        set_is_loading(true);

        const app = phantoms[0];
        if (app != undefined) props.last_customer_save.data = app.customer;

        const response = await fetch(app_view_appointment + date.toString(), {
            method: Method.POST,
            body: JSON.stringify(
                phantoms.map((appointment) => ({
                    customer: appointment.customer,
                    date: date.toString(),
                    time: appointment.time,
                    duration: appointment.duration,
                    details: appointment.details,
                    salon: "",
                })),
            ),
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
            reload_appointments();
        }

        to_default_state();
        set_is_loading(false);
    }

    function trigger_redraw() {
        set_appointments([...appointments]);
    }

    function to_default_state() {
        set_phantoms([]);
        set_changes([]);
        set_state(State.Default);
    }

    async function reload_appointments() {
        set_is_loading(true);

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

        set_is_loading(false);
    }

    async function delete_appointments() {
        if (current_state !== State.AppEdit) return;

        set_is_loading(true);

        const app = phantoms[0];
        if (app != undefined) props.last_customer_save.data = app.customer;

        const response = await fetch(app_view_appointment + date, {
            method: Method.DELETE,
            cache: "no-cache",
            body: JSON.stringify(phantoms),
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
            reload_appointments();
        }

        set_is_loading(false);
        to_default_state();
    }

    async function closing_update(appointment: Appointment) {
        return update_appointments([appointment]);
    }

    async function app_edit_confirm() {
        return update_appointments(changes);
    }

    async function update_appointments(appointments: Appointment[]) {
        if (appointments.length === 0) return;

        set_is_loading(true);

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
            reload_appointments();
        }

        to_default_state();
        set_is_loading(false);
    }

    async function close_appointment(data: {
        appointment: Appointment;
        close: Closing;
        account: Account;
    }) {
        set_is_loading(true);

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
            reload_appointments();
        }

        to_default_state();
        set_is_loading(false);
    }

    return (
        <div className="flex h-full w-full flex-1 flex-col overflow-y-auto">
            {current_state !== State.Default && !is_loading ? (
                <div
                    className={
                        current_state == State.Booking && phantoms.length === 0
                            ? "flex h-fit w-full justify-start"
                            : "flex h-1/3 w-full justify-start overflow-y-scroll"
                    }
                >
                    {current_state === State.Booking ? (
                        <Booking
                            last_customer_save={props.last_customer_save}
                            booking_time_hour={start_time}
                            phantom={phantoms}
                            set_phantom_appointments={set_phantoms}
                            on_change={trigger_redraw}
                            on_complete={book_appointments}
                        />
                    ) : current_state === State.AppEdit ? (
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
                            on_close={close_appointment}
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
                {current_state === State.Default ? (
                    <div className="flex h-fit w-fit gap-2">
                        <button
                            disabled={is_loading}
                            className="h-20 w-32 rounded-full border-2 border-sky-900 bg-sky-100"
                            onClick={() => {
                                set_start_time(8);
                                set_state(State.Booking);
                            }}
                        >
                            Booking
                        </button>
                        <button
                            disabled={is_loading}
                            className="h-20 w-32 rounded-full border-2 border-sky-900 bg-sky-100"
                            onClick={() => {
                                props.set_activity(
                                    AppViewActivity.CustomerView,
                                );
                            }}
                        >
                            Customer Finder
                        </button>
                        {props.admin == true ? (
                            <>
                                <button
                                    disabled={is_loading}
                                    className="h-20 w-32 rounded-full border-2 border-sky-900 bg-sky-100"
                                    onClick={() => {
                                        props.set_activity(
                                            AppViewActivity.DailyRecordView,
                                        );
                                    }}
                                >
                                    Daily Record
                                </button>
                                <button
                                    disabled={is_loading}
                                    className="h-20 w-32 rounded-full border-2 border-sky-900 bg-sky-100"
                                    onClick={() => {
                                        props.set_activity(
                                            AppViewActivity.SummaryView,
                                        );
                                    }}
                                >
                                    Summary
                                </button>
                                <a href="/salon/nav/">
                                    <button
                                        disabled={is_loading}
                                        className="h-20 w-32 rounded-full border-2 border-sky-900 bg-sky-100"
                                    >
                                        Other Actions
                                    </button>
                                </a>
                            </>
                        ) : null}
                    </div>
                ) : null}
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
                                    onPress={delete_appointments}
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
                                        ? to_default_state
                                        : () => {
                                              reload_appointments();
                                              to_default_state();
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
                                          if (appointment.technician === null) {
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
}
