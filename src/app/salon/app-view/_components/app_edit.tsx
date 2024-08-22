import { Button } from "@nextui-org/button";
import { useState } from "react";
import { Method } from "~/app/api/api_query";
import { handle_react_query_response } from "~/app/api/response_parser";
import { Appointment } from "~/server/db_schema/type_def";
import { to_appointment } from "~/server/validation/db_types/appointment_validation";
import { format_phone_number } from "~/server/validation/semantic/phone_format";
import { to_array } from "~/server/validation/simple_type";
import { TechSelectBar } from "./tech_select";
import { Input } from "@nextui-org/react";

export function AppEdit(props: {
    appointments: Appointment[];
    date: string;
    on_deselect: (appointment: Appointment) => void;
    on_delete: (appointments: Appointment[]) => void;
    on_update: () => void;
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
                    props.on_delete(appointments);
                },
            ),
        );
    }

    function change_time(delta: number) {
        for (let i = 0; i < props.appointments.length; i++) {
            const app = props.appointments[i];
            if (app != undefined) {
                app.time = ((app.time + 51 + delta) % 52) + 1;
            }
        }
        props.on_change();
    }

    function change_duration(delta: number) {
        for (let i = 0; i < props.appointments.length; i++) {
            const app = props.appointments[i];
            if (app != undefined) {
                app.duration = app.duration + delta;
                if (app.duration < 2) {
                    app.duration = 2;
                } else if (app.duration > 50) {
                    app.duration = 50;
                }
            }
        }
        props.on_change();
    }

    return (
        <div className="flex w-full flex-wrap">
            <div className="full flex w-full gap-1">
                <AppDisplay
                    appointments={props.appointments}
                    on_click={is_Loading ? () => {} : props.on_deselect}
                />
                <div className="flex w-full flex-1 flex-col flex-wrap gap-1 border-l-2 border-l-sky-500 p-1">
                    <div className="flex w-full">
                        {props.appointments.length > 0 ? (
                            <>
                                <div className="w-1/3 flex-wrap border-r-2 border-r-sky-500 p-1">
                                    <div className="w-full">Time</div>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            change_time(-1);
                                        }}
                                    >
                                        &lt;
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            change_time(1);
                                        }}
                                    >
                                        &gt;
                                    </Button>
                                </div>
                                <div className="w-1/3 flex-wrap border-r-2 border-r-sky-500 p-1">
                                    <div className="w-full">Duration</div>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            change_duration(-1);
                                        }}
                                    >
                                        &lt;
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            change_duration(1);
                                        }}
                                    >
                                        &gt;
                                    </Button>
                                </div>
                            </>
                        ) : null}
                        {props.appointments.length === 1 ? (
                            <div className="w-1/3 p-1">
                                <div className="w-full">Details</div>
                                <Input
                                    size="sm"
                                    defaultValue={
                                        props.appointments[0]
                                            ? props.appointments[0].details
                                            : ""
                                    }
                                    onValueChange={(value) => {
                                        const app = props.appointments[0];
                                        if (app != undefined) {
                                            app.details = value;
                                            props.on_change();
                                        }
                                    }}
                                />
                            </div>
                        ) : null}
                    </div>
                    <div className="flex w-full gap-1">
                        <Button
                            color="primary"
                            size="md"
                            isLoading={is_Loading}
                            onClick={() => {
                                set_Loading(true);
                                props.on_update();
                            }}
                        >
                            Confirm
                        </Button>
                        <Button
                            onClick={delete_appointments}
                            isLoading={is_Loading}
                            size="md"
                            color="danger"
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </div>
            {props.appointments.length === 1 ? (
                <TechSelectBar
                    on_select={(tech) => {
                        const app = props.appointments[0];
                        if (app != undefined) {
                            if (
                                app.technician != null &&
                                app.technician.id === tech.id
                            ) {
                                app.technician = null;
                            } else {
                                app.technician = tech;
                            }
                            props.on_change();
                        }
                    }}
                />
            ) : null}
        </div>
    );
}

function AppDisplay(props: {
    appointments: Appointment[];
    on_click: (appointment: Appointment) => void;
}) {
    return (
        <div className="h-fit w-1/3 overflow-y-auto">
            <div className="grid w-full grid-cols-1 justify-items-center">
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
        </div>
    );
}
