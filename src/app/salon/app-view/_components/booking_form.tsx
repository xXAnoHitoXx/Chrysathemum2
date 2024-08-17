import { Time } from "@internationalized/date";
import { useEffect, useState } from "react";
import { Appointment, Customer } from "~/server/db_schema/type_def";
import { CustomerSearch } from "../../_components/customer_search";
import { Button, Input, TimeInput } from "@nextui-org/react";

const Min_Time = new Time(8, 0);
const Max_Time = new Time(20, 59);
const Min_Duration = new Time(0, 15);
const Max_Duration = new Time(9, 0);

export type BookingFormData = {
    phantom_id: string;
    customer: Customer;
    app_time: number;
    time: Time;
    app_duration: number;
    duration: Time;
    details: string;
};

function to_appointment(form_data: BookingFormData): Appointment {
    return {
        id: form_data.phantom_id,
        date: "",
        customer: form_data.customer,
        time: form_data.app_time,
        duration: form_data.app_duration,
        details: form_data.details,
        technician: {
            id: "phantom_tech",
            name: "-",
            color: "border-neutral-400 text-neutral-900 bg-red-600",
            active: true,
        },
        salon: "",
    };
}

export function Booking(props: {
    set_phantom_appointments: (appointment: Appointment[]) => void;
    on_complete: () => void;
}) {
    const [phantom_data, set_phantom_data] = useState<BookingFormData[]>([]);
    const [add_more_phantom, set_add_phantom_state] = useState(true);
    const [is_loading, set_is_loading] = useState(false);

    useEffect(() => {
        props.set_phantom_appointments(phantom_data.map(to_appointment));
    }, [phantom_data]);

    function on_time_changed(time: Time, phantom: BookingFormData) {
        let t = time;
        if (time.compare(Min_Time) < 0) t = time.add({ hours: 12 });
        else if (time.compare(Max_Time) > 0) t = time.subtract({ hours: 12 });

        const app_t = (t.hour - 8) * 4 + Math.floor(t.minute / 15) + 1;

        phantom.time = t;
        phantom.app_time = app_t;

        set_phantom_data((prev_data) => {
            return [...prev_data];
        });
    }

    function on_duration_changed(duration: Time, phantom: BookingFormData) {
        let d = duration;
        if (duration.compare(Min_Duration) < 0) d = Min_Duration;
        if (duration.compare(Max_Duration) > 0) d = Max_Duration;

        const app_d = d.hour * 4 + Math.floor(d.minute / 15);

        phantom.duration = d;
        phantom.app_duration = app_d;

        set_phantom_data((prev_data) => {
            return [...prev_data];
        });
    }

    function on_detail_change(details: string, phantom: BookingFormData) {
        phantom.details = details;
        set_phantom_data((prev_data) => {
            return [...prev_data];
        });
    }

    return add_more_phantom ? (
        <CustomerSearch
            on_complete={(customer) => {
                const p = phantom_data[0];

                const phantom =
                    p == undefined
                        ? {
                              phantom_id: "phantom" + phantom_data.length,
                              customer: customer,
                              time: new Time(8, 0),
                              app_time: 1,
                              duration: new Time(1, 0),
                              app_duration: 4,
                              details: "",
                          }
                        : {
                              phantom_id: "phantom" + phantom_data.length,
                              customer: customer,
                              time: p.time,
                              app_time: p.app_time,
                              duration: p.duration,
                              app_duration: p.app_duration,
                              details: p.details,
                          };

                set_add_phantom_state(false);
                set_phantom_data((prev_data) => [...prev_data, phantom]);
            }}
        />
    ) : (
        <div className="flex w-full flex-wrap">
            {phantom_data.map((data) => (
                <>
                    <TimeInput
                        isDisabled={is_loading}
                        className="w-1/3 p-1"
                        label="Time"
                        value={data.time}
                        onChange={(time) => {
                            on_time_changed(time, data);
                        }}
                    />
                    <TimeInput
                        isDisabled={is_loading}
                        className="w-1/3 p-1"
                        label="Duration"
                        value={data.duration}
                        hourCycle={24}
                        onChange={(duration) => {
                            on_duration_changed(duration, data);
                        }}
                    />
                    <Input
                        isDisabled={is_loading}
                        className="w-1/3 p-1"
                        label="Appointment Details"
                        value={data.details}
                        onValueChange={(details) => {
                            on_detail_change(details, data);
                        }}
                    />
                </>
            ))}
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
            <Button
                onClick={() => {
                    set_add_phantom_state(true);
                }}
                isLoading={is_loading}
                className="w-1/12 p-1"
                color="secondary"
            >
                +1 more
            </Button>
        </div>
    );
}
