import { Dispatch, SetStateAction, useState } from "react";
import { Appointment } from "~/server/db_schema/type_def";
import {
    CustomerSearch,
    LastCustomerSave,
} from "../../_components/customer_search";
import { Button, Input } from "@nextui-org/react";
import {
    DURATION_30_MINUTES,
    hour_to_time,
    MAX_APPOINTMENT_DURATION,
    MAX_APPOINTMENT_TIME,
    modulus,
    to_0_index,
    to_1_index,
} from "~/server/validation/semantic/appointment_time";

export function Booking(props: {
    last_customer_save: LastCustomerSave;
    booking_time_hour: number;
    phantom: Appointment[];
    set_phantom_appointments: Dispatch<SetStateAction<Appointment[]>>;
    on_change: () => void;
    on_complete: () => void;
}) {
    const [is_loading, set_is_loading] = useState(false);

    function change_time(app: Appointment, delta: number) {
        let t = to_0_index(app.time) + delta;
        t = modulus(t, MAX_APPOINTMENT_TIME);
        app.time = to_1_index(t);
    }

    function change_time_all(delta: number) {
        for (let i = 0; i < props.phantom.length; i++) {
            const app = props.phantom[i];
            if (app != undefined) {
                change_time(app, delta);
            }
        }
    }

    function change_duration_all(delta: number) {
        for (let i = 0; i < props.phantom.length; i++) {
            const app = props.phantom[i];
            if (app != undefined) {
                change_duration(app, delta);
            }
        }
    }

    function change_duration(app: Appointment, delta: number) {
        app.duration = app.duration + delta;
        if (app.duration < DURATION_30_MINUTES) {
            app.duration = MAX_APPOINTMENT_DURATION;
        } else if (app.duration > MAX_APPOINTMENT_DURATION) {
            app.duration = DURATION_30_MINUTES;
        }
    }

    return props.phantom.length === 0 ? (
        <CustomerSearch
            save={props.last_customer_save}
            on_complete={(customer) => {
                const p: Appointment = {
                    id: "phantom0",
                    customer: customer,
                    date: "",
                    technician: {
                        id: "phantom",
                        name: "Booking",
                        color: "border-neutral-400 text-neutral-900 bg-red-400",
                        active: true,
                        login_claimed: undefined,
                    },
                    time: hour_to_time(props.booking_time_hour),
                    duration: 4,
                    details: "",
                    salon: "",
                };
                props.set_phantom_appointments([p]);
            }}
        />
    ) : (
        <div className="flex w-full flex-col justify-items-start">
            <div className="flex h-fit w-full">
                <div className="w-1/3 flex-wrap gap-1 border-r-2 border-r-sky-900 p-1">
                    <div className="w-full">Time</div>
                    <Button
                        size="sm"
                        onClick={() => {
                            change_time_all(-1);
                            props.on_change();
                        }}
                    >
                        &lt;
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => {
                            change_time_all(1);
                            props.on_change();
                        }}
                    >
                        &gt;
                    </Button>
                </div>
                <div className="w-1/3 flex-wrap gap-1 border-r-2 border-r-sky-900 p-1">
                    <div className="w-full">Duration</div>
                    <Button
                        size="sm"
                        onClick={() => {
                            change_duration_all(-1);
                            props.on_change();
                        }}
                    >
                        &lt;
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => {
                            change_duration_all(1);
                            props.on_change();
                        }}
                    >
                        &gt;
                    </Button>
                </div>
                <div className="flex w-1/3 justify-items-center gap-3 p-1">
                    <Button
                        onClick={() => {
                            set_is_loading(true);
                            const p0 = props.phantom[0];
                            if (p0 != undefined) {
                                const p: Appointment = {
                                    ...p0,
                                    id: "phantom" + props.phantom.length,
                                };

                                props.set_phantom_appointments((prev_data) => [
                                    ...prev_data,
                                    p,
                                ]);
                            }
                            set_is_loading(false);
                        }}
                        isLoading={is_loading}
                        className="w-1/12 p-1"
                        color="secondary"
                    >
                        +1 more
                    </Button>
                    <Button
                        onClick={() => {
                            set_is_loading(true);
                            props.on_complete();
                        }}
                        isLoading={is_loading}
                        className="w-1/12 p-1"
                        color="primary"
                    >
                        Confirm
                    </Button>
                </div>
            </div>
            {props.phantom.map((data) => (
                <div className="flex w-full">
                    <div className="w-1/3 flex-wrap gap-1 border-r-2 border-r-sky-900 p-1">
                        <div className="w-full">Time</div>
                        <Button
                            size="sm"
                            onClick={() => {
                                change_time(data, -1);
                                props.on_change();
                            }}
                        >
                            &lt;
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => {
                                change_time(data, 1);
                                props.on_change();
                            }}
                        >
                            &gt;
                        </Button>
                    </div>
                    <div className="w-1/3 flex-wrap gap-1 border-r-2 border-r-sky-900 p-1">
                        <div className="w-full">Duration</div>
                        <Button
                            size="sm"
                            onClick={() => {
                                change_duration(data, -1);
                                props.on_change();
                            }}
                        >
                            &lt;
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => {
                                change_duration(data, 1);
                                props.on_change();
                            }}
                        >
                            &gt;
                        </Button>
                    </div>
                    <div className="flex w-1/3 flex-wrap p-1">
                        <div className="w-full">Details</div>
                        <Input
                            size="sm"
                            isDisabled={is_loading}
                            defaultValue={data.details}
                            onValueChange={(details) => {
                                data.details = details;
                                props.on_change();
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
