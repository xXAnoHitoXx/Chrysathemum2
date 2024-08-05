"use client"

import { fetch_query, Method } from "~/app/api/api_query"
import { DataError, is_data_error } from "~/server/data_error"
import { Appointment } from "~/server/db_schema/type_def"
import { to_appointment } from "~/server/validation/db_types/appointment_validation"
import { to_array } from "~/server/validation/simple_type"
import { Board } from "./_component/board"

export default async function Page(params: {date: string}) {
    let appointments: Appointment[] | DataError = await fetch_query({
        url: "/api/app_view",
        method: Method.GET,
        params: {
            data: params.date
        },
        to: to_array(to_appointment),
    })

    if(is_data_error(appointments)) {
        appointments.report()
        appointments = [];
    }

    return (
        <div className="flex flex-wrap gap-2 p-2">
            <a href="/salon/nav/">
                <button className="h-20 w-32 rounded-full border-2 border-sky-400">
                    Actions
                </button>
            </a>
            <div
                id="AppointmentEntry View"
                className="flex h-fit w-full flex-nowrap overflow-x-scroll"
            >
                <Board appointments={appointments} />
            </div>
        </div>
    )
}
