import { map, range } from "itertools";
import { Appointment, Hour } from "~/server/db_schema/type_def";
import { format_phone_number } from "~/server/validation/semantic/phone_format";
import { bubble_sort } from "~/util/ano_bubble_sort";

function timestamp(time: number, hours: Hour) {
    const stamp =
        time < 12
            ? time.toString().concat(" am")
            : time == 12
              ? time.toString().concat(" pm")
              : (time - 12).toString().concat(" pm");

    const color =
        time < hours.open || time >= hours.close
            ? //close
              time % 2 == 1
                ? "bg-red-800 text-zinc-300"
                : "bg-red-500 text-zinc-900"
            : //open
              time % 2 == 1
              ? "bg-neutral-800 text-zinc-300"
              : "bg-neutral-400 text-zinc-900";

    return (
        <div
            key={"time_".concat(time.toString())}
            draggable="false"
            className={"row-start-1 h-10".concat(
                " ",
                "col-start-",
                ((time - 8) * 4 + 1).toString(),
                " ",
                "col-span-4",
                " ",
                color,
            )}
        >
            {stamp}
        </div>
    );
}

export function Board(props: {
    appointments: Appointment[];
    on_select: (appointment: Appointment) => void;
}) {
    bubble_sort(props.appointments, (a, b) => {
        if (a.time !== b.time) return b.time - a.time;
        if (a.customer.id !== b.customer.id)
            return a.customer.id.localeCompare(b.customer.id);
        return a.id.localeCompare(b.id);
    });

    function short_hand(name: string): string {
        const short = name.split(" ")[0];
        if (short == undefined) return "";
        return short;
    }

    return (
        <div
            id="AppointmentEntry View"
            className="flex-1 flex-nowrap overflow-x-scroll"
        >
            <ul className="m-2 grid grid-flow-row-dense auto-rows-max grid-cols-appointment-board">
                {map(range(8, 21), (i) =>
                    timestamp(i, { open: 10, close: 19 }),
                )}
                {props.appointments.map((app: Appointment) => {
                    const app_color =
                        app.technician == null
                            ? "border-violet-500 text-violet-500 bg-slate-950"
                            : app.technician.color;
                    const app_col = "col-start-".concat(app.time.toString());
                    const app_span = "col-span-".concat(
                        app.duration.toString(),
                    );

                    return (
                        <li
                            className={"border-2".concat(
                                " ",
                                app_color,
                                " ",
                                app_col,
                                " ",
                                app_span,
                                " ",
                                "row-span-1 m-1 rounded",
                            )}
                        >
                            <button
                                className="ml-1 h-full w-full text-ellipsis text-left"
                                onClick={() => {
                                    props.on_select(app);
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
    );
}
