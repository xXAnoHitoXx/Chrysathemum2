import { Button, CalendarDate, RangeValue } from "@heroui/react";
import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { Method } from "~/app/api/api_query";
import { AccountDisplay } from "./_summary/earnings_display";
import { last_monday, last_sunday } from "~/util/date";
import { TechnicianEarnings } from "~/server/earnings/type_def";
import { z } from "zod";
import { BoardDateRangePicker } from "~/app/_components/ui_elements/date_range_picker";

export function SummaryView(props: { salon: string; return: () => void }) {
    const start = props.salon === "SCVL" ? last_monday() : last_sunday();

    const [date_range, set_date_range] = useState<RangeValue<CalendarDate>>({
        start: start,
        end: start.add({ days: 6 }),
    });

    const [entries, set_entries] = useState<Map<string, TechnicianEarnings[]>>(
        new Map(),
    );

    const summary_api = "/api/app_view/summary/";

    useQueries({
        queries: [date_range]
            .flatMap((date_range) => {
                const dates: string[] = [];
                let date = date_range.start.copy();
                while (date.compare(date_range.end) <= 0) {
                    dates.push(date.toString());
                    date = date.add({ days: 1 });
                }
                return dates;
            })
            .map((date) => {
                return {
                    queryFn: async () => {
                        const response = await fetch(summary_api + date, {
                            method: Method.GET,
                            cache: "no-store",
                        });
                        if (response.status === 200) {
                            const accounts = z
                                .array(TechnicianEarnings)
                                .safeParse(await response.json());

                            if (accounts.success) {
                                set_entries((prev) => {
                                    const next = new Map(prev);
                                    next.set(date, accounts.data);
                                    return next;
                                });
                            }
                        }
                        return 0;
                    },
                    queryKey: ["summary", date_range, date],
                };
            }),
    });

    return (
        <div className="flex h-full w-full flex-col">
            <div className="flex h-fit w-full justify-between p-2">
                <BoardDateRangePicker
                    dates={date_range}
                    set_date={set_date_range}
                />
                <Button color="danger" size="md" onPress={props.return}>
                    Return
                </Button>
            </div>
            <AccountDisplay accounts={Array.from(entries.values()).flat()} />
        </div>
    );
}
