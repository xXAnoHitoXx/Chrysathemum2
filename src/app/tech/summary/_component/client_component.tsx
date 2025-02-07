"use client";

import { CalendarDate, RangeValue } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Method } from "~/app/api/api_query";
import { BoardDateRangePicker } from "~/app/salon/app-view/_components/date_range_picker";
import { TechAccountDisplay } from "./tech_account_display";
import { last_monday, last_sunday } from "~/util/date";
import { TechnicianEarnings } from "~/server/earnings/type_def";
import { bubble_sort } from "~/util/sorter/ano_bubble_sort";
import { useRouter } from "next/navigation";

export function TechSummaryView(props: { salon: string }) {
    const router = useRouter();
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

    const summary_api = "/api/tech_view/summary/";
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

            let parse_failed = false;

            if (response.status === 200) {
                const tech_acc = TechnicianEarnings.safeParse(
                    await response.json(),
                );
                if (tech_acc.success)
                    set_entries((prev) => {
                        const next = [...prev, tech_acc.data];
                        bubble_sort(next, (a, b) => {
                            return a.date.localeCompare(b.date);
                        });
                        const next_day = date_to_load.add({ days: 1 });

                        if (next_day.compare(date_range.end) <= 0) {
                            load_date(next_day);
                        }
                        return next;
                    });
                else parse_failed = true;
            }

            if (response.status === 500 || parse_failed) {
                set_entries((prev) => {
                    const next = [...prev];
                    const next_day = date_to_load.add({ days: 1 });
                    if (next_day.compare(date_range.end) <= 0) {
                        load_date(next_day);
                    }
                    return next;
                });
            } else {
                router.replace("/");
            }

            return 0;
        },
        queryKey: ["summary", date_to_load],
    });

    return (
        <div className="flex w-full flex-col">
            <div className="flex h-fit w-full justify-between p-2">
                <BoardDateRangePicker
                    dates={date_range}
                    set_date={set_date_range}
                />
                {query.isLoading
                    ? `Loading: [${date_to_load}]...`
                    : `Loaded up to: [${date_to_load}]`}
            </div>
            <TechAccountDisplay accounts={entries} />
        </div>
    );
}
