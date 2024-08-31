"use client";

import {
    Appointment,
    Closing as Close,
    Account,
} from "~/server/db_schema/type_def";
import { Dispatch, SetStateAction, useState } from "react";
import { Method } from "~/app/api/api_query";
import { to_array } from "~/server/validation/simple_type";
import { to_appointment } from "~/server/validation/db_types/appointment_validation";
import { handle_react_query_response } from "~/app/api/response_parser";
import { current_date } from "~/server/validation/semantic/date";
import { BoardDatePicker } from "./_components/date_picker";
import { Board } from "./_components/board";
import { Booking } from "./_components/booking_form";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@nextui-org/button";
import { AppEdit } from "./_components/app_edit";
import {
    BOARD_STARTING_HOUR,
    TIME_INTERVALS_PER_HOUR,
    to_1_index,
} from "~/server/validation/semantic/appointment_time";
import {
    ErrorMessage_BisquitRetrival,
    ErrorMessage_DoesNotExist,
} from "~/server/error_messages/messages";
import { useRouter } from "next/navigation";
import { Closing } from "./_components/closing";

export enum State {
    Default = "Default",
    Booking = "Booking",
    AppEdit = "Edit",
    Closing = "Closing",
}

const app_view_appointment = "/api/app_view/appointment/";

const useAppointmentList = (
    date: string,
): [Appointment[], Dispatch<SetStateAction<Appointment[]>>] => {
    const [appointments, set_appointments] = useState<Appointment[]>([]);
    const router = useRouter();

    useQuery({
        queryFn: () =>
            fetch(app_view_appointment + date, {
                method: Method.GET,
                cache: "no-store",
            }).then(
                handle_react_query_response(
                    to_array(to_appointment),
                    (appointments) => {
                        set_appointments(appointments);
                    },
                    (error) => {
                        if (
                            error.contains([
                                ErrorMessage_BisquitRetrival,
                                ErrorMessage_DoesNotExist,
                            ])
                        ) {
                            router.replace("/");
                        }
                    },
                ),
            ),
        queryKey: ["appointment_list", date],
    });

    return [appointments, set_appointments];
};

export default function Page() {
    // general
    const [current_state, set_state] = useState(State.Default);
    const [date, set_date] = useState(current_date());
    const [appointments, set_appointments] = useAppointmentList(
        date.toString(),
    );

    const [phantoms, set_phantoms] = useState<Appointment[]>([]);
    const [changes, set_changes] = useState<Appointment[]>([]);
    const [start_time, set_start_time] = useState(1);

    const [is_loading, set_is_loading] = useState(false);

    async function book_appointments() {
        set_is_loading(true);
        await fetch(app_view_appointment + date.toString(), {
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
        })
            .then(
                handle_react_query_response(
                    to_array(to_appointment),
                    (appointments) => {
                        set_appointments(appointments);
                    },
                ),
            )
            .finally(() => {
                to_default_state();
                set_is_loading(false);
            });
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

        await fetch(app_view_appointment + date, {
            method: Method.GET,
            cache: "no-store",
        })
            .then(
                handle_react_query_response(
                    to_array(to_appointment),
                    (appointments) => {
                        set_appointments(appointments);
                    },
                ),
            )
            .finally(() => {
                set_is_loading(false);
            });
    }

    async function delete_appointments() {
        if (current_state !== State.AppEdit) return;

        set_is_loading(true);

        await fetch(app_view_appointment + date, {
            method: Method.DELETE,
            cache: "no-cache",
            body: JSON.stringify(phantoms),
        })
            .then(
                handle_react_query_response(
                    to_array(to_appointment),
                    (appointments) => {
                        set_appointments(appointments);
                    },
                ),
                reload_appointments,
            )
            .catch(reload_appointments)
            .finally(() => {
                to_default_state();
                set_is_loading(false);
            });
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

        await fetch(app_view_appointment + date, {
            method: Method.PATCH,
            cache: "no-store",
            body: JSON.stringify(appointments),
        })
            .then(
                handle_react_query_response(
                    to_array(to_appointment),
                    (appointments) => {
                        set_appointments(appointments);
                    },
                    reload_appointments,
                ),
            )
            .catch(reload_appointments)
            .finally(() => {
                to_default_state();
                set_is_loading(false);
            });
    }

    async function close_appointment(data: {
        appointment: Appointment;
        close: Close;
        account: Account;
    }) {
        set_is_loading(true);
        await fetch(app_view_appointment + date, {
            method: Method.PUT,
            cache: "no-cache",
            body: JSON.stringify(data),
        })
            .then(
                handle_react_query_response(
                    to_array(to_appointment),
                    (appointments) => {
                        set_appointments(appointments);
                    },
                    reload_appointments,
                ),
            )
            .catch(reload_appointments)
            .finally(() => {
                to_default_state();
                set_is_loading(false);
            });
    }

    return (
        <div className="flex flex-1 flex-col overflow-y-auto">
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
                            booking_time_hour={start_time}
                            phantom={phantoms}
                            set_phantom_appointments={set_phantoms}
                            on_change={trigger_redraw}
                            on_complete={book_appointments}
                        />
                    ) : current_state === State.AppEdit ? (
                        <AppEdit
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
                        <Closing
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
                        <a href="/salon/nav/">
                            <button
                                disabled={is_loading}
                                className="h-20 w-32 rounded-full border-2 border-sky-900 bg-sky-100"
                            >
                                Other Actions
                            </button>
                        </a>
                    </div>
                ) : null}
                <div className="m-1 flex h-fit w-full flex-row-reverse border-t-2 border-t-sky-900 p-1">
                    <div className="flex w-1/4 flex-row-reverse gap-10">
                        {current_state === State.AppEdit ? (
                            <>
                                <Button
                                    color="primary"
                                    isLoading={is_loading}
                                    onClick={app_edit_confirm}
                                >
                                    Confirm
                                </Button>
                                <Button
                                    color="danger"
                                    isLoading={is_loading}
                                    onClick={delete_appointments}
                                >
                                    Delete
                                </Button>
                            </>
                        ) : null}
                        {current_state !== State.Default ? (
                            <Button
                                color="danger"
                                isLoading={is_loading}
                                onClick={
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
                        <BoardDatePicker set_date={set_date} />
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
