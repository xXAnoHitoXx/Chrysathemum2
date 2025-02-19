import { CalendarDate, DateValue } from "@internationalized/date";
import {
    Button,
    Popover,
    PopoverContent,
    PopoverTrigger,
    RangeCalendar,
    RangeValue,
} from "@heroui/react";
import { Dispatch, SetStateAction, useState } from "react";

export function BoardDateRangePicker(props: {
    dates: RangeValue<CalendarDate>;
    set_date: Dispatch<SetStateAction<RangeValue<CalendarDate>>>;
}) {
    const [holder, update_date] = useState<RangeValue<DateValue>>({
        start: props.dates.start,
        end: props.dates.end,
    });

    return (
        <div className="flex w-fit h-fit flex-wrap gap-1">
            <Popover
                placement="bottom"
                onClose={() => {
                    props.set_date({
                        start: new CalendarDate(
                            holder.start.year,
                            holder.start.month,
                            holder.start.day,
                        ),
                        end: new CalendarDate(
                            holder.end.year,
                            holder.end.month,
                            holder.end.day,
                        ),
                    });
                }}
            >
                <PopoverTrigger>
                    <Button className="w-64">
                        {holder.start.toString() +
                            " <-> " +
                            holder.end.toString()}
                    </Button>
                </PopoverTrigger>
                <PopoverContent>
                    <RangeCalendar
                        classNames={{
                            base: "h-96 w-fit",
                            content: "h-96 w-fit",
                            gridHeaderCell: "w-12 h-12",
                            cell: "w-12 h-12",
                            cellButton: "w-12 h-12",
                        }}
                        visibleMonths={
                            holder.start.month + 1 === holder.end.month ? 2 : 1
                        }
                        hideDisabledDates={true}
                        weekdayStyle="short"
                        value={holder}
                        onChange={update_date}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
