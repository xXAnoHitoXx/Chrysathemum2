import { Button } from "@heroui/button";
import { TechSelectBar } from "./tech_select";
import { Input } from "@heroui/react";
import { NoTechColor } from "~/constants";
import { Technician } from "~/server/technician/type_def";
import { Appointment } from "~/server/appointment/type_def";
import { format_phone_number } from "~/util/phone_format";

export function AppEdit(props: {
    technicians: Technician[];
    appointments: Appointment[];
    date: string;
    on_deselect: (appointment: Appointment) => void;
    on_change: () => void;
}) {
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
                    on_click={props.on_deselect}
                />
                <div className="flex w-full flex-1 flex-col flex-wrap gap-1 border-l-2 border-l-sky-900 p-1">
                    <div className="flex w-full">
                        {props.appointments.length > 0 ? (
                            <>
                                <div className="w-1/3 flex-wrap border-r-2 border-r-sky-900 p-1">
                                    <div className="w-full">Time</div>
                                    <Button
                                        size="sm"
                                        onPress={() => {
                                            change_time(-1);
                                        }}
                                    >
                                        &lt;
                                    </Button>
                                    <Button
                                        size="sm"
                                        onPress={() => {
                                            change_time(1);
                                        }}
                                    >
                                        &gt;
                                    </Button>
                                </div>
                                <div className="w-1/3 flex-wrap border-r-2 border-r-sky-900 p-1">
                                    <div className="w-full">Duration</div>
                                    <Button
                                        size="sm"
                                        onPress={() => {
                                            change_duration(-1);
                                        }}
                                    >
                                        &lt;
                                    </Button>
                                    <Button
                                        size="sm"
                                        onPress={() => {
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
                </div>
            </div>
            {props.appointments.length === 1 ? (
                <TechSelectBar
                    technicians={props.technicians}
                    on_select={(tech) => {
                        const app = props.appointments[0];
                        if (app != undefined) {
                            if (
                                app.technician != undefined &&
                                app.technician.id === tech.id
                            ) {
                                app.technician = undefined;
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
                            ? NoTechColor
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
