import { map, range } from "itertools";
import { Appointment } from "~/server/appointment/type_def";
import {
    BOARD_ENDING_HOUR,
    BOARD_STARTING_HOUR,
    hour_to_time,
} from "~/util/appointment_time";
import { format_phone_number } from "~/util/phone_format";
import { bubble_sort } from "~/util/sorter/ano_bubble_sort";
import { Hour } from "../type_def";

function timestamp(time: number, hours: Hour, on_click: () => void) {
    const stamp =
        time < 12
            ? time.toString().concat(" am")
            : time === 12
              ? time.toString().concat(" pm")
              : (time - 12).toString().concat(" pm");

    const color =
        time < hours.open || time >= hours.close
            ? //close
              time % 2 == 1
                ? "bg-red-600 text-zinc-950"
                : "bg-red-400 text-zinc-950"
            : //open
              time % 2 == 1
              ? "bg-neutral-400 text-zinc-950"
              : "bg-sky-100 text-zinc-950";

    return (
        <div
            key={"time_".concat(time.toString())}
            draggable="false"
            className={"row-start-1 h-10 border-b-3 border-b-sky-800".concat(
                " ",
                "col-start-",
                hour_to_time(time).toString(),
                " ",
                "col-span-4",
                " ",
                color,
            )}
            onClick={on_click}
        >
            {stamp}
        </div>
    );
}

export function AppointmentBoard(props: {
    appointments: Appointment[];
    on_appoitment_select: (appointment: Appointment) => void;
    on_time_stamp: (time: number) => void;
}) {
    bubble_sort(props.appointments, (a, b) => a.id.localeCompare(b.id));

    function short_hand(name: string): string {
        const short = name.split(" ")[0];
        if (short == undefined) return "";
        return short;
    }

    return (
        <div id="AppointmentEntry View" className="w-full flex-1 bg-white p-2">
            <div className="flex h-full w-full flex-none flex-nowrap overflow-x-auto border-4 border-sky-900">
                <div className="h-fit w-fit">
                    <ul className="grid h-fit w-fit grid-flow-row-dense auto-rows-max grid-cols-appointment-board">
                        {map(
                            range(BOARD_STARTING_HOUR, BOARD_ENDING_HOUR),
                            (i) =>
                                timestamp(i, { open: 10, close: 19 }, () => {
                                    props.on_time_stamp(i);
                                }),
                        )}
                        {props.appointments.map((app: Appointment) => {
                            const app_color =
                                app.technician == null
                                    ? "border-zinc-950 bg-sky-100 text-zinc-950 "
                                    : app.technician.color;
                            const app_col = "col-start-".concat(
                                app.time.toString(),
                            );
                            const app_span = "col-span-".concat(
                                app.duration.toString(),
                            );

                            return (
                                <li
                                    key={app.id}
                                    className={"border-2".concat(
                                        " ",
                                        app_color,
                                        " ",
                                        app_col,
                                        " ",
                                        app_span,
                                        " ",
                                        "row-span-1 rounded",
                                    )}
                                >
                                    <button
                                        className="ml-1 h-full w-full text-ellipsis text-left"
                                        onClick={() => {
                                            props.on_appoitment_select(app);
                                        }}
                                    >
                                        {app.customer.name}
                                        <br />
                                        {app.duration > 2 ? (
                                            <>
                                                {format_phone_number(
                                                    app.customer.phone_number,
                                                )}
                                                <br />
                                            </>
                                        ) : null}
                                        {app.technician == null
                                            ? null
                                            : short_hand(app.technician.name) +
                                              " " +
                                              "-" +
                                              " "}
                                        {app.details}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
}
