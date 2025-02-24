import { CalendarDate } from "@internationalized/date";
import { Dispatch, SetStateAction, useState } from "react";
import { Appointment } from "~/server/appointment/type_def";
import { AppViewActivity } from "../../../_components/app_view_page";
import { ControlBar } from "../board/control_bar";
import { Button } from "@heroui/button";
import { AppointmentBoard } from "../board/appointment_board";
import { useRouter } from "next/navigation";

export function MainTask({
    is_admin,
    set_activity,
    appointments,
    set_appointments,
    date,
    set_date,
    book_appointment_at,
    edit_appointment,
}: {
    is_admin: boolean;
    set_activity: Dispatch<SetStateAction<AppViewActivity>>;
    appointments: Appointment[];
    set_appointments: Dispatch<SetStateAction<Appointment[]>>;
    date: CalendarDate;
    set_date: Dispatch<SetStateAction<CalendarDate>>;
    book_appointment_at: (time: number) => void;
    edit_appointment: (appointment: Appointment, edit_mode: boolean) => void;
}) {
    function Menu() {
        const router = useRouter();

        return (
            <div className="flex h-fit w-full gap-2 p-2">
                <button
                    className="h-20 w-32 rounded-full border-2 border-sky-900 bg-sky-100"
                    onClick={() => {
                        book_appointment_at(8);
                    }}
                >
                    Book
                </button>
                <button
                    className="h-20 w-32 rounded-full border-2 border-sky-900 bg-sky-100"
                    onClick={() => {
                        set_activity(AppViewActivity.CustomerView);
                    }}
                >
                    Customer Finder
                </button>
                {is_admin == true ? (
                    <>
                        <button
                            className="h-20 w-32 rounded-full border-2 border-sky-900 bg-sky-100"
                            onClick={() => {
                                set_activity(AppViewActivity.DailyRecordView);
                            }}
                        >
                            Daily Record
                        </button>
                        <button
                            className="h-20 w-32 rounded-full border-2 border-sky-900 bg-sky-100"
                            onClick={() => {
                                set_activity(AppViewActivity.SummaryView);
                            }}
                        >
                            Summary
                        </button>
                        <button
                            className="h-20 w-32 rounded-full border-2 border-sky-900 bg-sky-100"
                            onClick={() => router.push("/salon/tech-mana/nav/")}
                        >
                            Manage Technicians
                        </button>
                        <button
                            className="h-20 w-32 rounded-full border-2 border-sky-400"
                            onClick={() => router.push("/salon/migration")}
                        >
                            Migration Station
                        </button>
                    </>
                ) : null}
            </div>
        );
    }

    const [menu_open, set_menu_open] = useState(true);

    return (
        <div className="flex h-full w-full flex-col">
            {menu_open ? <Menu /> : null}
            <ControlBar date={date} set_date={set_date}>
                {menu_open ? (
                    <Button
                        color="danger"
                        onPress={() => {
                            set_menu_open(false);
                            set_appointments((prev) => [...prev]);
                        }}
                    >
                        ^^^
                    </Button>
                ) : (
                    <Button
                        color="primary"
                        onPress={() => {
                            set_menu_open(true);
                            set_appointments((prev) => [...prev]);
                        }}
                    >
                        vvv
                    </Button>
                )}
            </ControlBar>
            <AppointmentBoard
                appointments={appointments}
                on_appoitment_select={(app) => {
                    edit_appointment(app, app.technician === undefined);
                }}
                on_time_stamp={book_appointment_at}
            />
        </div>
    );
}
