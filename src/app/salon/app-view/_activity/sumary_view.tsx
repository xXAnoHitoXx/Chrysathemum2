import { CalendarDate, RangeValue } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { BoardDateRangePicker } from "../_components/date_range_picker";
import { last_sunday } from "~/server/validation/semantic/date";
import { useQuery } from "@tanstack/react-query";
import { Method } from "~/app/api/api_query";
import { handle_react_query_response } from "~/app/api/response_parser";
import { to_array } from "~/server/validation/simple_type";
import { TechAccount, to_tech_account } from "~/server/queries/earnings/types";
import { bubble_sort } from "~/util/ano_bubble_sort";
import { AccountDisplay } from "./summary/earnings_display";

export function SummaryView() {
    const [date_range, set_date_range] = useState<RangeValue<CalendarDate>>({
        start: last_sunday().subtract({ weeks: 1 }),
        end: last_sunday(),
    });

    const [date_to_load, load_date] = useState<CalendarDate | null>(null);
    const [entries, set_entries] = useState<TechAccount[]>([]);

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

            await fetch(summary_api + date_to_load.toString(), {
                method: Method.GET,
                cache: "no-store",
            }).then(
                handle_react_query_response(
                    to_array(to_tech_account),
                    (tech_acc) => {
                        set_entries((prev) => {
                            const next = [...prev, ...tech_acc];
                            bubble_sort(next, (a, b) => {
                                const comp = a.tech.id.localeCompare(b.tech.id);
                                if (comp != 0) return comp;

                                return a.date.localeCompare(b.date);
                            });
                            return next;
                        });

                        const next_day = date_to_load.add({ days: 1 });

                        if (next_day.compare(date_range.end) <= 0) {
                            load_date(next_day);
                        }
                    },
                ),
            );

            return 0;
        },
        queryKey: ["summary", date_to_load],
    });

    return (
        <div>
            <BoardDateRangePicker
                dates={date_range}
                set_date={set_date_range}
            />
            {query.isLoading ? "Loading..." : null}
            <AccountDisplay accounts={entries} />
        </div>
    );
}
