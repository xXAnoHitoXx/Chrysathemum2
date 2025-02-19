import { CalendarDate } from "@internationalized/date";
import { Dispatch, ReactNode, SetStateAction } from "react";
import { BoardDatePicker } from "~/app/_components/ui_elements/date_picker";

export function ControlBar({
    children,
    date,
    set_date,
}: {
    children: ReactNode;
    date: CalendarDate;
    set_date: Dispatch<SetStateAction<CalendarDate>>;
}) {
    return (
        <div className="flex h-fit w-full justify-between p-2">
            <BoardDatePicker date={date} set_date={set_date} />
            <div className="flex h-fit w-fit flex-row-reverse gap-10">{children}</div>
        </div>
    );
}
