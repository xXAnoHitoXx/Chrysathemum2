"use client"

import { useDragAndDrop } from "@formkit/drag-and-drop/react";
import { map, range } from "itertools";
import { RefObject, useState } from "react";
import { Appointment, Hour } from "~/server/db_schema/type_def";
import { quick_sort } from "~/util/ano_quick_sort";

function Display(props: { appointments: Appointment[] }) {
    return(
        <div/>
    );
}

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
        <div key={"time_".concat(time.toString())} className={"h-10 row-start-1".concat(" col-start-", ((time - 8) * 4 + 1).toString(), 
            " col-span-4 ", color)}>
            {stamp}
        </div>);
}

export function Board(props:{ appointments: Appointment[] }) {
    quick_sort(props.appointments, (a: Appointment, b: Appointment) => {
        if (a.time == b.time) {
            return a.customer_id.localeCompare(b.customer_id);
        }
        return a.time - b.time;
    })

    const [appointments, set_appointments] = useState(props.appointments);

    const [grid] = useDragAndDrop<HTMLDivElement, Appointment>([], {
        dropZone: false,
    })

    const dragging_windows: { index: string, window: RefObject<HTMLDivElement>, appointments: Appointment[] }[] = [];

    for (const index of range(1, 53)) {
        const [window, items] = useDragAndDrop<HTMLDivElement, Appointment>([]);
        dragging_windows.push({ index: index.toString(), window: window, appointments: items })
    }

    return (
        <div className="grid grid-cols-1 grid-rows-1 m-1" >
            <div className="row-start-1 col-start-1 grid auto-rows-max grid-cols-appointment-board">
                {dragging_windows.map(({ index, window }) => (
                    <div 
                        key={index}
                        ref={window} 
                        className={"border-1 border-blue-500 min-h-32 row-start-1 row-span-1 col-span-1 col-start-".concat(index)}
                    />
                ))}
            </div>
            <div ref={grid} className="row-start-1 col-start-1 grid auto-rows-max grid-cols-appointment-board">
                { map(range(8, 21), (i) => (
                    timestamp(i, { open: 10, close: 19 })
                )) }
                <Display appointments={appointments}/>
            </div>
        </div>
    );
}
