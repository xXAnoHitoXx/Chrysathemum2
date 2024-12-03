import { CalendarDate, RangeValue } from "@nextui-org/react";
import { useState } from "react";
import { BoardDateRangePicker } from "../_components/date_range_picker";
import { last_sunday } from "~/server/validation/semantic/date";

export function SummaryView() {
    const [date_range, set_date_range] = useState<RangeValue<CalendarDate>>({
        start: last_sunday().subtract({ weeks: 1 }),
        end: last_sunday(),
    });
    return (
        <div>
            <BoardDateRangePicker
                dates={date_range}
                set_date={set_date_range}
            />
        </div>
    );
}
