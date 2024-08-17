import { CalendarDate } from "@internationalized/date";
import { Button, DatePicker } from "@nextui-org/react";
import { Dispatch, SetStateAction, useState } from "react";

export function BoardDatePicker(props: {
    date: CalendarDate;
    set_date: Dispatch<SetStateAction<CalendarDate>>;
}) {
    const [holder, update_date] = useState(props.date);
    return (
        <div className="flex w-3/4 flex-wrap gap-1">
            <DatePicker
                className="w-36"
                label="Date"
                value={holder}
                onChange={update_date}
            />
            <Button
                color="primary"
                onClick={() => {
                    props.set_date(holder);
                }}
            >
                Select Date
            </Button>
            <Button
                color="secondary"
                onClick={() => {
                    console.log(props.date);
                    update_date(props.date);
                }}
            >
                Reset
            </Button>
        </div>
    );
}
