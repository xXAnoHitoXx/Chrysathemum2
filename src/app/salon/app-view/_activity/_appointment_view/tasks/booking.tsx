import { Dispatch, SetStateAction, useState } from "react";
import { Appointment } from "~/server/appointment/type_def";
import {
    CustomerSearch,
    LastCustomerSave,
} from "../../../_components/customer_search";
import { hour_to_time } from "~/util/appointment_time";
import { Button } from "@heroui/button";
import { CalendarDate } from "@heroui/react";
import { BookingForm } from "./booking/form";
import { ControlBar } from "../board/control_bar";
import { AppointmentBoard } from "../board/appointment_board";

export function BookingTask({
    appointments,
    date,
    set_date,
    hour,
    save,
    on_cancel,
    on_book,
}: {
    appointments: Appointment[];
    date: CalendarDate;
    set_date: Dispatch<SetStateAction<CalendarDate>>;
    hour: number;
    save: LastCustomerSave;
    on_cancel: () => void;
    on_book: (appointments: Appointment[]) => void;
}) {
    const [phantoms, set_phantoms] = useState<Appointment[]>([]);
    const [is_loading, set_loading] = useState(false);

    console.log(is_loading);

    if (phantoms.length === 0) {
        return (
            <CustomerSearch
                save={save}
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
                        time: hour_to_time(hour),
                        duration: 4,
                        details: "",
                        salon: "",
                    };
                    set_phantoms([p]);
                }}
            />
        );
    } else {
        return (
            <div className="flex w-full flex-1 flex-col">
                {!is_loading ? (
                    <div className="flex h-1/3 w-full justify-start overflow-y-scroll border-b-2 border-b-sky-900">
                        <BookingForm
                            phantoms={phantoms}
                            set_phantoms={set_phantoms}
                        />
                    </div>
                ) : null}
                <ControlBar date={date} set_date={set_date}>
                    <div className="flex h-full w-fit border-x-2 border-x-sky-900 px-4">
                        <Button color="warning" onPress={on_cancel}>
                            Cancel
                        </Button>
                    </div>
                    <Button
                        color="primary"
                        isLoading={is_loading}
                        onPress={() => {
                            set_loading(true);
                            on_book(phantoms);
                        }}
                    >
                        Confirm
                    </Button>
                    <Button
                        onPress={() => {
                            const p0 = phantoms[0];
                            if (p0 != undefined) {
                                const p: Appointment = {
                                    ...p0,
                                    id: "phantom" + phantoms.length,
                                };

                                set_phantoms((prev_data) => [...prev_data, p]);
                            }
                        }}
                        className="w-1/12 p-1"
                        color="secondary"
                    >
                        +1 more
                    </Button>
                </ControlBar>
                <AppointmentBoard
                    appointments={[...appointments, ...phantoms]}
                    on_appoitment_select={() => {}}
                    on_time_stamp={
                        is_loading
                            ? () => {}
                            : (hour) => {
                                  set_phantoms((phantoms) =>
                                      phantoms.map((phantom) => {
                                          return {
                                              ...phantom,
                                              time: hour_to_time(hour),
                                          };
                                      }),
                                  );
                              }
                    }
                />
            </div>
        );
    }
}
