"use client";

import { Appointment } from "~/server/db_schema/type_def";
import { useEffect, useState } from "react";
import { Method } from "~/app/api/api_query";
import { to_array } from "~/server/validation/simple_type";
import { to_appointment } from "~/server/validation/db_types/appointment_validation";
import { is_data_error } from "~/server/data_error";
import { parse_response } from "~/app/api/response_parser";
import { current_date } from "~/server/validation/semantic/date";
import { quick_sort } from "~/util/ano_quick_sort";
import { BoardDatePicker } from "./_components/date_picker";
import { Board } from "./_components/board";

export enum State {
    Default,
    Booking,
}

export default function Page() {
    //general
    const [current_state, set_state] = useState(State.Default);
    const [date, set_date] = useState(current_date());
    const [appointments, set_appointments] = useState<Appointment[]>([]);
    const [phantoms, set_phantoms] = useState<Appointment[]>([]);

    useEffect(() => {
        async function load_appointments() {
            const response = await fetch("/api/app_view/" + date.toString(), {
                method: Method.GET,
            });

            const apps = await parse_response(
                response,
                to_array(to_appointment),
            );

            if (is_data_error(apps)) {
                apps.report();
            } else {
                quick_sort(apps, (a, b) => {
                    if (a.time == b.time) {
                        return a.customer.id.localeCompare(b.customer.id);
                    }
                    return a.time - b.time;
                });

                set_appointments(apps);
            }
        }
        void load_appointments();
    }, [date]);

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

            <BoardDatePicker date={date} set_date={set_date} />
            <Board
                appointments={[...appointments, ...phantoms]}
                on_select={(_) => {}}
            />
        </div>
    );
}
