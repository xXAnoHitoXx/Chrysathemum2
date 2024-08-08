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
        id: "phantom",
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
    set_board_onclick: (onclick: (appointment: Appointment) => void) => void;
    on_complete: () => void;
}) {
    const [phantom_data, set_phantom_data] = useState<{
        arr: BookingFormData[];
        record: Record<string, BookingFormData>;
        active_phantom: BookingFormData | null;
        push: boolean;
        complete: boolean;
    }>({
        arr: [],
        record: {},
        active_phantom: null,
        push: false,
        complete: false,
    });

    useEffect(() => {
        props.set_board_onclick((appointment: Appointment) => {
            set_phantom_data((prev) => {
                const phantom = prev.record[appointment.id];
                if (phantom) {
                    const arr = prev.arr.filter(
                        (data) => data.phantom_id != phantom.phantom_id,
                    );
                    const record = prev.record;
                    delete record[phantom.phantom_id];

                    if (prev.active_phantom != null) {
                        record[prev.active_phantom.phantom_id] =
                            prev.active_phantom;
                        return {
                            ...prev,
                            arr: [...arr, prev.active_phantom],
                            record: record,
                            active_phantom: phantom,
                        };
                    } else
                        return {
                            ...prev,
                            arr: arr,
                            record: record,
                            active_phantom: phantom,
                        };
                } else return prev;
            });
        });
    }, []);

    useEffect(() => {
        if (phantom_data.complete) {
            props.on_complete();
            return;
        }

        if (phantom_data.push) {
            set_phantom_data((prev) => {
                if (prev.active_phantom != null)
                    return {
                        arr: [...prev.arr, prev.active_phantom],
                        record: {
                            ...prev.record,
                            [prev.active_phantom.phantom_id]:
                                prev.active_phantom,
                        },
                        active_phantom: null,
                        push: false,
                        complete: false,
                    };
                else
                    return {
                        ...prev,
                        push: false,
                        complete: false,
                    };
            });
            return;
        }

        const display =
            phantom_data.active_phantom == null
                ? phantom_data.arr
                : [...phantom_data.arr, phantom_data.active_phantom];

        props.set_phantom_appointments(display.map(to_appointment));
    }, [phantom_data]);

    function on_time_changed(time: Time) {
        let t = time;
        if (time.compare(Min_Time) < 0) t = time.add({ hours: 12 });
        else if (time.compare(Max_Time) > 0) t = time.subtract({ hours: 12 });

        const app_t = (t.hour - 8) * 4 + Math.floor(t.minute / 15) + 1;

        set_phantom_data((prev_data) => {
            if (prev_data.active_phantom != null) {
                return {
                    ...prev_data,
                    active_phantom: {
                        ...prev_data.active_phantom,
                        time: t,
                        app_time: app_t,
                    },
                };
            }
            return prev_data;
        });
    }

    function on_duration_changed(duration: Time) {
        let d = duration;
        if (duration.compare(Min_Duration) < 0) d = Min_Duration;
        if (duration.compare(Max_Duration) > 0) d = Max_Duration;

        const app_d = d.hour * 4 + Math.floor(d.minute / 15);

        set_phantom_data((prev_data) => {
            if (prev_data.active_phantom != null) {
                return {
                    ...prev_data,
                    active_phantom: {
                        ...prev_data.active_phantom,
                        duration: d,
                        app_duration: app_d,
                    },
                };
            }
            return prev_data;
        });
    }

    function on_detail_change(details: string) {
        set_phantom_data((prev_data) => {
            if (prev_data.active_phantom != null) {
                return {
                    ...prev_data,
                    active_phantom: {
                        ...prev_data.active_phantom,
                        details: details,
                    },
                };
            }
            return prev_data;
        });
    }

    return phantom_data.active_phantom == null ? (
        <CustomerSearch
            on_complete={(customer) => {
                const phantom = {
                    phantom_id: "phantom" + phantom_data.arr.length,
                    customer: customer,
                    time: new Time(8, 0),
                    app_time: 1,
                    duration: new Time(1, 0),
                    app_duration: 4,
                    details: "",
                };

                set_phantom_data((prev_data) => ({
                    ...prev_data,
                    active_phantom: phantom,
                }));
            }}
        />
    ) : (
        <div className="flex w-full flex-wrap">
            <TimeInput
                isDisabled={phantom_data.push || phantom_data.complete}
                className="w-1/3 p-1"
                label="Time"
                value={phantom_data.active_phantom.time}
                onChange={on_time_changed}
            />
            <TimeInput
                isDisabled={phantom_data.push || phantom_data.complete}
                className="w-1/3 p-1"
                label="Duration"
                value={phantom_data.active_phantom.duration}
                hourCycle={24}
                onChange={on_duration_changed}
            />
            <Input
                isDisabled={phantom_data.push || phantom_data.complete}
                className="w-1/3 p-1"
                label="Appointment Details"
                value={phantom_data.active_phantom.details}
                onValueChange={on_detail_change}
            />
            <Button
                onClick={() => {
                    set_phantom_data((prev) => ({ ...prev, complete: true }));
                }}
                isLoading={phantom_data.push || phantom_data.complete}
                className="w-1/12 p-1"
                color="primary"
            >
                Confirm
            </Button>
            <Button
                onClick={() => {
                    set_phantom_data((prev) => ({ ...prev, push: true }));
                }}
                isLoading={phantom_data.push || phantom_data.complete}
                className="w-1/12 p-1"
                color="secondary"
            >
                +1 more
            </Button>
        </div>
    );
}
