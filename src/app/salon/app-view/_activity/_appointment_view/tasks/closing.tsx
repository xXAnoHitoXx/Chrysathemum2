import { Appointment } from "~/server/appointment/type_def";
import { AppointmentClosingData } from "~/server/transaction/type_def";
import { AppointmentBoard } from "../board/appointment_board";
import { ControlBar } from "../board/control_bar";
import { CalendarDate } from "@internationalized/date";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { ClosingForm } from "./closing/closing_form";

export function ClosingTask({
    appointment,
    appointments,
    date,
    set_date,
    to_edit_mode,
    on_close,
    on_cancel,
}: {
    appointment: Appointment;
    appointments: Appointment[];
    date: CalendarDate;
    set_date: Dispatch<SetStateAction<CalendarDate>>;
    to_edit_mode: () => void;
    on_close: (data: AppointmentClosingData) => void;
    on_cancel: () => void;
}) {
    const [date_holder, set_holder_date] = useState(date);
    const [board_appointments, set_board_appointments] = useState(appointments);
    const [is_loading, set_is_loading] = useState(false);
    const [closing_data, set_closing_data] =
        useState<AppointmentClosingData | null>(null);

    useEffect(() => {
        if (date_holder.compare(date) != 0) {
            set_is_loading(true);
            set_date(date_holder);
            on_cancel();
        }
    }, [date_holder, date]);

    return (
        <div className="flex h-full w-full flex-col">
            {!is_loading ? (
                <div className="flex flex-row-reverse items-center gap-2 p-2">
                    <Button color="success" onPress={to_edit_mode}>
                        &gt;
                    </Button>
                    <div className="flex-1 border-r-2 border-r-sky-900">
                        <ClosingForm
                            appointment={appointment}
                            set_closing_data={set_closing_data}
                            on_change={() => {
                                set_board_appointments((data) => [...data]);
                            }}
                        />
                    </div>
                </div>
            ) : null}
            <ControlBar date={date_holder} set_date={set_holder_date}>
                <div className="flex h-full w-fit border-x-2 border-x-sky-900 px-4">
                    <Button color="warning" onPress={on_cancel}>
                        Cancel
                    </Button>
                </div>
                <Button
                    color={closing_data === null ? "danger" : "primary"}
                    onPress={() => {
                        if (closing_data !== null) {
                            set_is_loading(true);
                            on_close(closing_data);
                        }
                    }}
                >
                    Confirm
                </Button>
            </ControlBar>
            <AppointmentBoard
                appointments={board_appointments}
                on_time_stamp={() => {}}
                on_appoitment_select={() => {}}
            />
        </div>
    );
}
