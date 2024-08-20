"use client";

import { Appointment } from "~/server/db_schema/type_def";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Method } from "~/app/api/api_query";
import { to_array } from "~/server/validation/simple_type";
import { to_appointment } from "~/server/validation/db_types/appointment_validation";
import { is_data_error } from "~/server/data_error";
import {
    handle_react_query_response,
    parse_response,
} from "~/app/api/response_parser";
import { current_date } from "~/server/validation/semantic/date";
import { BoardDatePicker } from "./_components/date_picker";
import { Board } from "./_components/board";
import { Booking } from "./_components/booking_form";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@nextui-org/button";
import { AppEdit } from "./_components/app_edit";

export enum State {
    Default = "Default",
    Booking = "Booking",
    AppEdit = "Edit",
}

const useAppointmentList = (
    date: string,
): [Appointment[], Dispatch<SetStateAction<Appointment[]>>] => {
    const [appointments, set_appointments] = useState<Appointment[]>([]);

    useQuery({
        queryFn: () =>
            fetch("/api/app_view/" + date, {
                method: Method.GET,
                cache: "no-store",
            }).then(
                handle_react_query_response(
                    to_array(to_appointment),
                    (appointments) => {
                        set_appointments(appointments);
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
    const [phantoms, set_phantoms] = useState<Appointment[]>([]);
    const [appointments, set_appointments] = useAppointmentList(
        date.toString(),
    );

    const [focus_appointments, set_focus] = useState<Appointment[]>([]);

    useEffect(() => {
        if (
            current_state === State.AppEdit &&
            focus_appointments.length === 0
        ) {
            set_state(State.Default);
        }
    }, [focus_appointments]);

    async function book_appointments() {
        const response = await fetch("/api/app_view/" + date.toString(), {
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

        const appointments = await parse_response(
            response,
            to_array(to_appointment),
        );

        if (is_data_error(appointments)) {
            appointments.log();
            appointments.report();
            return;
        }

        set_appointments(appointments);
        to_default_state();
    }

    function to_default_state() {
        set_phantoms([]);
        set_focus([]);
        set_state(State.Default);
    }

    return (
        <div className="flex flex-wrap gap-2 p-2">
            {current_state === State.Default ? (
                <div className="flex w-fit">
                    <button
                        onClick={() => {
                            set_state(State.Booking);
                        }}
                        className="h-20 w-32 rounded-full border-2 border-sky-400"
                    >
                        Book Appointment
                    </button>
                    <a href="/salon/nav/">
                        <button className="h-20 w-32 rounded-full border-2 border-sky-400">
                            Other Actions
                        </button>
                    </a>
                </div>
            ) : null}
            <div className="m-1 flex w-full border-t-2 border-t-sky-500 p-1">
                <BoardDatePicker date={date} set_date={set_date} />
                <div className="flex w-1/4 flex-row-reverse">
                    {current_state !== State.Default ? (
                        <Button color="danger" onClick={to_default_state}>
                            X
                        </Button>
                    ) : null}
                </div>
            </div>

            <Board
                appointments={[...appointments, ...phantoms]}
                on_select={(appointment) => {
                    if (focus_appointments.includes(appointment)) {
                        return;
                    }
                    set_focus([...focus_appointments, appointment]);
                    set_state(State.AppEdit);
                }}
            />
            {current_state === State.Booking ? (
                <Booking
                    set_phantom_appointments={set_phantoms}
                    on_complete={book_appointments}
                />
            ) : current_state === State.AppEdit ? (
                <AppEdit
                    appointments={focus_appointments}
                    date={date.toString()}
                    on_deselect={(appointment) => {
                        set_focus([
                            ...focus_appointments.filter(
                                (app) => app.id !== appointment.id,
                            ),
                        ]);
                    }}
                    on_change={() => {}}
                    on_complete={(appointments) => {
                        set_appointments(appointments);
                        to_default_state();
                    }}
                />
            ) : null}
        </div>
    );
}
