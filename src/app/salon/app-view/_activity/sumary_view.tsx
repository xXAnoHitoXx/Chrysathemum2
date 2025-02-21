import { CalendarDate, RangeValue } from "@heroui/react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Method } from "~/app/api/api_query";
import { AccountDisplay } from "./_summary/earnings_display";
import { last_monday, last_sunday } from "~/util/date";
import { TechnicianEarnings } from "~/server/earnings/type_def";
import { z } from "zod";
import { bubble_sort } from "~/util/sorter/ano_bubble_sort";
import { BoardDateRangePicker } from "~/app/_components/ui_elements/date_range_picker";

export function SummaryView(props: { salon: string }) {
    const start = props.salon === "SCVL" ? last_monday() : last_sunday();

    const [date_range, set_date_range] = useState<RangeValue<CalendarDate>>({
        start: start,
        end: start.add({ days: 6 }),
    });

    const [date_to_load, load_date] = useState<CalendarDate | null>(null);
    const [entries, set_entries] = useState<TechnicianEarnings[]>([]);

    useEffect(() => {
        load_date(date_range.start);
    }, [date_range]);

    const summary_api = "/api/app_view/summary/";
    const query = useQuery({
        queryFn: async () => {
            if (date_to_load == null) {
                return 0;
            }

            if (date_to_load.compare(date_range.start) == 0) {
                set_entries((_) => []);
            }

            const response = await fetch(
                summary_api + date_to_load.toString(),
                {
                    method: Method.GET,
                    cache: "no-store",
                },
            );
            if (response.status === 200) {
                const accounts = z
                    .array(TechnicianEarnings)
                    .safeParse(await response.json());

                if (accounts.success) {
                    set_entries((prev) => {
                        const next = [...prev, ...accounts.data];
                        bubble_sort(next, (a, b) => {
                            const comp = a.tech.id.localeCompare(b.tech.id);
                            if (comp != 0) return comp;

                            return a.date.localeCompare(b.date);
                        });
                        const next_day = date_to_load.add({ days: 1 });

                        if (next_day.compare(date_range.end) <= 0) {
                            load_date(next_day);
                        }
                        return next;
                    });
                }
            }
            return 0;
        },
        queryKey: ["summary", date_to_load],
    });

    return (
        <div className="flex h-full w-full flex-col">
            <div className="flex h-fit w-full justify-between p-2">
                <BoardDateRangePicker
                    dates={date_range}
                    set_date={set_date_range}
                />
                {query.isLoading
                    ? `Loading: [${date_to_load}]...`
                    : `Loaded up to: [${date_to_load}]`}
            </div>
            <AccountDisplay accounts={entries} />
        </div>
    );
}
