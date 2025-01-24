import { CalendarDate } from "@internationalized/date";
import {
    Button, Calendar,
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@heroui/react";
import { Dispatch, SetStateAction, useState } from "react";
import { current_date } from "~/server/validation/semantic/date";

export function BoardDatePicker(props: {
    date: CalendarDate;
    set_date: Dispatch<SetStateAction<CalendarDate>>;
}) {
    const [holder, update_date] = useState(props.date);
    return (
        <div className="flex w-3/4 flex-wrap gap-1">
            <Popover
                placement="bottom"
                onClose={() => {
                    props.set_date(holder);
                }}
            >
                <PopoverTrigger>
                    <Button className="w-36">{holder.toString()}</Button>
                </PopoverTrigger>
                <PopoverContent>
                    <Calendar
                        classNames={{
                            base: "h-96 w-96",
                            content: "h-96 w-96",
                            gridHeaderCell: "w-12 h-12",
                            cell: "w-12 h-12",
                            cellButton: "w-12 h-12",
                        }}
                        weekdayStyle="short"
                        onChange={(date) => {
                            update_date(
                                new CalendarDate(
                                    date.year,
                                    date.month,
                                    date.day,
                                ),
                            );
                        }}
                    />
                </PopoverContent>
            </Popover>
            <Button
                color="secondary"
                onPress={() => {
                    update_date(current_date());
                    props.set_date(holder);
                }}
            >
                Reset
            </Button>
        </div>
    );
}
