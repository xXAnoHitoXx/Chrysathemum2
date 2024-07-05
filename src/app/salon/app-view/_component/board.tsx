"use client"

import { map, range } from "itertools";
import { useState } from "react";
import { Appointment, Hour } from "~/server/db_schema/type_def";
import { bubble_sort } from "~/util/ano_bubble_sort";

function timestamp(time: number, hours: Hour) {
    const stamp = (time < 12)? time.toString().concat(" am") : 
        (time == 12)? time.toString().concat(" pm") : (time - 12).toString().concat(" pm");

    const color = (time < hours.open || time >= hours.close)?
        //close
        (time % 2 == 1)? "bg-red-800 text-zinc-300" : "bg-red-500 text-zinc-900"
        :
        //open
        (time % 2 == 1)? "bg-neutral-800 text-zinc-300" : "bg-neutral-400 text-zinc-900"

    return(
        <div key={"time_".concat(time.toString())} draggable="false" className={"h-10 row-start-1".concat(" col-start-", ((time - 8) * 4 + 1).toString(), 
            " col-span-4 ", color)}>
            {stamp}
        </div>
    );
}

export function Board(props:{ appointments: Appointment[] }) {
    bubble_sort(props.appointments, (a: Appointment, b: Appointment) => {
        if (a.time == b.time) {
            return a.customer.id.localeCompare(b.customer.id);
        }
        return a.time - b.time;
    });

    const [appointments, set_appointments] = useState(props.appointments);

    return (
        <ul className="grid auto-rows-max grid-cols-appointment-board m-2">
            { map(range(8, 21), (i) => (
                timestamp(i, { open: 10, close: 19 })
            )) }
            { appointments.map((app: Appointment) => {
                const app_color = (app.technician == null)? "border-violet-500 text-violet-500 bg-slate-950" : app.technician.color;
                const app_col = "col-start-".concat(app.time.toString());
                const app_span = "col-span-".concat(app.duration.toString());

                return (
                    <li className={"border-2 ".concat(app_color, " ",
                        app_col, " ", app_span, " row-span-2 rounded m-1"
                    )}>
                        <button className="w-full h-full text-ellipsis">
                        {app.customer.name}
                        <br/>
                        {app.customer.phone_number}
                        <br/>
                        {app.details}
                        </button>
                    </li>
                );
            }) }
        </ul>
    );
}
