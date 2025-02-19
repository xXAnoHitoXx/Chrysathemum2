import { Button } from "@heroui/button";
import { Input } from "@heroui/react";
import { Dispatch, SetStateAction } from "react";
import { Appointment } from "~/server/appointment/type_def";
import {
    DURATION_30_MINUTES,
    MAX_APPOINTMENT_DURATION,
    MAX_APPOINTMENT_TIME,
    modulus,
    to_0_index,
    to_1_index,
} from "~/util/appointment_time";

export function BookingForm({
    phantoms,
    set_phantoms,
}: {
    phantoms: Appointment[];
    set_phantoms: Dispatch<SetStateAction<Appointment[]>>;
}) {
    function on_change() {
        set_phantoms((apps) => [...apps]);
    }

    function change_time(app: Appointment, delta: number) {
        let t = to_0_index(app.time) + delta;
        t = modulus(t, MAX_APPOINTMENT_TIME);
        app.time = to_1_index(t);
    }

    function change_time_all(delta: number) {
        for (let i = 0; i < phantoms.length; i++) {
            const app = phantoms[i];
            if (app != undefined) {
                change_time(app, delta);
            }
        }
    }

    function change_duration_all(delta: number) {
        for (let i = 0; i < phantoms.length; i++) {
            const app = phantoms[i];
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

    return (
        <div className="flex w-full flex-col justify-items-start">
            <div className="flex h-fit w-full">
                <div className="w-1/3 flex-wrap gap-1 border-r-2 border-r-sky-900 p-1">
                    <div className="w-full">Time</div>
                    <Button
                        size="sm"
                        onPress={() => {
                            change_time_all(-1);
                            on_change();
                        }}
                    >
                        &lt;
                    </Button>
                    <Button
                        size="sm"
                        onPress={() => {
                            change_time_all(1);
                            on_change();
                        }}
                    >
                        &gt;
                    </Button>
                </div>
                <div className="w-1/3 flex-wrap gap-1 border-r-2 border-r-sky-900 p-1">
                    <div className="w-full">Duration</div>
                    <Button
                        size="sm"
                        onPress={() => {
                            change_duration_all(-1);
                            on_change();
                        }}
                    >
                        &lt;
                    </Button>
                    <Button
                        size="sm"
                        onPress={() => {
                            change_duration_all(1);
                            on_change();
                        }}
                    >
                        &gt;
                    </Button>
                </div>
            </div>
            {phantoms.map((data) => (
                <div className="flex w-full">
                    <div className="w-1/3 flex-wrap gap-1 border-r-2 border-r-sky-900 p-1">
                        <div className="w-full">Time</div>
                        <Button
                            size="sm"
                            onPress={() => {
                                change_time(data, -1);
                                on_change();
                            }}
                        >
                            &lt;
                        </Button>
                        <Button
                            size="sm"
                            onPress={() => {
                                change_time(data, 1);
                                on_change();
                            }}
                        >
                            &gt;
                        </Button>
                    </div>
                    <div className="w-1/3 flex-wrap gap-1 border-r-2 border-r-sky-900 p-1">
                        <div className="w-full">Duration</div>
                        <Button
                            size="sm"
                            onPress={() => {
                                change_duration(data, -1);
                                on_change();
                            }}
                        >
                            &lt;
                        </Button>
                        <Button
                            size="sm"
                            onPress={() => {
                                change_duration(data, 1);
                                on_change();
                            }}
                        >
                            &gt;
                        </Button>
                    </div>
                    <div className="flex w-1/3 flex-wrap p-1">
                        <div className="w-full">Details</div>
                        <Input
                            size="sm"
                            defaultValue={data.details}
                            onValueChange={(details) => {
                                data.details = details;
                                on_change();
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
