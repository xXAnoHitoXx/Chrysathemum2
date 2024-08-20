import { Button } from "@nextui-org/button";
import { useState } from "react";
import { Method } from "~/app/api/api_query";
import { handle_react_query_response } from "~/app/api/response_parser";
import { Appointment } from "~/server/db_schema/type_def";
import { to_appointment } from "~/server/validation/db_types/appointment_validation";
import { format_phone_number } from "~/server/validation/semantic/phone_format";
import { to_array } from "~/server/validation/simple_type";

export function AppEdit(props: {
    appointments: Appointment[];
    date: string;
    on_deselect: (appointment: Appointment) => void;
    on_complete: (appointments: Appointment[]) => void;
    on_change: () => void;
}) {
    const [is_Loading, set_Loading] = useState(false);

    async function delete_appointments() {
        set_Loading(true);

        await fetch("/api/app_view/" + props.date, {
            method: Method.DELETE,
            cache: "no-cache",
            body: JSON.stringify(props.appointments),
        }).then(
            handle_react_query_response(
                to_array(to_appointment),
                (appointments) => {
                    props.on_complete(appointments);
                },
            ),
        );
    }

    return (
        <div className="flex w-full gap-1">
            <AppDisplay
                appointments={props.appointments}
                on_click={is_Loading ? () => {} : props.on_deselect}
            />
            <Button onClick={delete_appointments} color="danger">
                Delete
            </Button>
        </div>
    );
}

function AppDisplay(props: {
    appointments: Appointment[];
    on_click: (appointment: Appointment) => void;
}) {
    return (
        <div className="grid h-fit w-1/3 grid-cols-1 justify-items-center border-r-2 border-r-sky-500">
            {props.appointments.map((app) => {
                const app_color =
                    app.technician == null
                        ? "border-violet-500 text-violet-500 bg-slate-950"
                        : app.technician.color;
                return (
                    <button
                        className={"w-5/6 border-2".concat(
                            " ",
                            app_color,
                            " ",
                            "m-1 rounded",
                        )}
                        onClick={() => {
                            props.on_click(app);
                        }}
                    >
                        {app.customer.name}
                        <br />
                        {format_phone_number(app.customer.phone_number)}
                        <br />
                        {app.technician == null
                            ? null
                            : app.technician.name + " " + "-" + " "}
                        {app.details}
                    </button>
                );
            })}
        </div>
    );
}
