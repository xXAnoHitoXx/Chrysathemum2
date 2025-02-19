import { CalendarDate } from "@internationalized/date";
import { Dispatch, SetStateAction, useState } from "react";
import { Appointment, AppointmentUpdate } from "~/server/appointment/type_def";
import { AppEdit } from "./edit/form";
import { Technician } from "~/server/technician/type_def";
import { ControlBar } from "../board/control_bar";
import { Button } from "@heroui/button";
import { AppointmentBoard } from "../board/appointment_board";

type Change = {
    original_appointment: Appointment;
    update: AppointmentUpdate;
};

export function EditTask({
    appointments,
    date,
    set_date,
    technicians,
    initial_app,
    apply_edit,
    on_cancel,
}: {
    appointments: Appointment[];
    date: CalendarDate;
    set_date: Dispatch<SetStateAction<CalendarDate>>;
    technicians: Technician[];
    initial_app: Appointment;
    apply_edit: (updates: AppointmentUpdate[], deletes: Appointment[]) => void;
    on_cancel: () => void;
}) {
    const initial = { ...initial_app };
    // the appointment in focus and change.update.appointment is the same object
    const [focus, set_focus] = useState([initial]);
    const [changes, set_changes] = useState<Change[]>([
        {
            original_appointment: initial_app,
            update: {
                appointment: initial,
                new_date: date.toString(),
            },
        },
    ]);
    const [deleted, set_deleted] = useState<Appointment[]>([]);

    function get_board_appointments(): Appointment[] {
        let board = appointments.filter((app) => app.date === date.toString());

        const changes_map: Record<string, Change> = {};

        for (const change of changes) {
            changes_map[change.original_appointment.id] = change;

            if (change.update.new_date === date.toString()) {
                board.push(change.update.appointment);
            }
        }

        const ids: string[] = [];
        const apps: Appointment[] = [];

        for (const app of board) {
            if (!ids.includes(app.id)) {
                ids.push(app.id);
                apps.push(app);
            }
        }

        board = apps;

        board = board.map((app) => {
            const changed = changes_map[app.id];
            if (changed === undefined) {
                return app;
            }

            return changed.update.appointment;
        });

        return [...board];
    }

    function delete_focus() {
        const deletes: Appointment[] = [...deleted];
        const new_changes = changes.filter((change) => {
            const deleted = focus.includes(change.update.appointment);
            if (deleted) {
                deletes.push(change.original_appointment);
            }
            return !deleted;
        });

        if (new_changes.length === 0) {
            apply_edit([], deletes);
            return;
        }

        set_deleted(deletes);
        set_changes(new_changes);
        set_focus([]);
    }

    return (
        <div className="flex w-full flex-1 flex-col overflow-y-auto">
            <AppEdit
                technicians={technicians}
                appointments={focus}
                on_deselect={(deselect_app) => {
                    set_focus((apps) =>
                        apps.filter((app) => app.id !== deselect_app.id),
                    );
                    set_changes((changes) =>
                        changes.map((change) => {
                            if (
                                change.original_appointment.id ===
                                deselect_app.id
                            ) {
                                return {
                                    original_appointment:
                                        change.original_appointment,
                                    update: {
                                        appointment: deselect_app,
                                        new_date: date.toString(),
                                    },
                                };
                            }
                            return change;
                        }),
                    );
                }}
                on_change={() => {
                    set_focus((apps) => [...apps]);
                }}
            />
            <ControlBar date={date} set_date={set_date}>
                <div className="flex h-full w-fit border-x-2 border-x-sky-900 px-4">
                    <Button color="warning" onPress={on_cancel}>
                        Cancel
                    </Button>
                </div>
                <Button
                    color="primary"
                    onPress={() => {
                        const focus_ids = focus.map((app) => app.id);
                        apply_edit(
                            changes.map((change) => {
                                if (
                                    focus_ids.includes(
                                        change.original_appointment.id,
                                    )
                                ) {
                                    change.update.new_date = date.toString();
                                }
                                return change.update;
                            }),
                            deleted,
                        );
                    }}
                >
                    Confirm
                </Button>
                <Button color="danger" onPress={delete_focus}>
                    Delete
                </Button>
            </ControlBar>
            <AppointmentBoard
                appointments={get_board_appointments()}
                on_appoitment_select={(appointment) => {
                    const is_focused = focus.reduce(
                        (partial: boolean, app: Appointment) => {
                            return partial || app.id === appointment.id;
                        },
                        false,
                    );

                    const in_changed = changes.reduce(
                        (partial: Change | null, change: Change) => {
                            if (partial !== null) {
                                return partial;
                            }

                            if (
                                change.original_appointment.id ===
                                appointment.id
                            ) {
                                return change;
                            }

                            return null;
                        },
                        null,
                    );

                    if (is_focused) {
                        if (in_changed === null) {
                            throw new Error("invalid state");
                        }

                        if (focus.length > 1) {
                            in_changed.update.new_date = date.toString();
                            set_focus((f) =>
                                f.filter((app) => app.id === appointment.id),
                            );
                        }
                    } else {
                        if (in_changed === null) {
                            set_focus((f) => [...f, appointment]);
                            set_changes((change) => [
                                ...change,
                                {
                                    original_appointment: { ...appointment },
                                    update: {
                                        new_date: appointment.date,
                                        appointment: appointment,
                                    },
                                },
                            ]);
                        } else {
                            set_focus((f) => [
                                ...f,
                                in_changed.update.appointment,
                            ]);
                        }
                    }
                }}
                on_time_stamp={() => {}}
            />
        </div>
    );
}
