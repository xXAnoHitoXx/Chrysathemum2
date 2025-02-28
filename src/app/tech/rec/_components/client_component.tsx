"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { ReactNode, useState } from "react";
import { Method } from "~/app/api/api_query";
import { TransactionDisplay } from "./transaction_display";
import { Technician } from "~/server/technician/type_def";
import { current_date } from "~/util/date";
import { Transaction } from "~/server/transaction/type_def";
import { z } from "zod";
import { quick_sort } from "~/util/sorter/ano_quick_sort";
import { BoardDatePicker } from "~/app/_components/ui_elements/date_picker";

const rec_view_transaction = "/api/tech_view/record/";

export function TechDataDisplay(props: {
    tech: Technician;
    children: ReactNode;
}) {
    const [date, set_date] = useState(current_date());

    const [transactions, set_transactions] = useState<Transaction[]>([]);
    const router = useRouter();

    const { isFetching } = useQuery({
        queryFn: async () => {
            const response = await fetch(rec_view_transaction + date, {
                method: Method.GET,
                cache: "no-store",
            });

            if (response.status === 200) {
                const transactions = z
                    .array(Transaction)
                    .safeParse(await response.json());

                if (transactions.success) {
                    set_transactions(() => {
                        quick_sort(transactions.data, (a, b) => {
                            const time_diff = a.time - b.time;
                            if (time_diff != 0) return time_diff;

                            return a.customer.id.localeCompare(b.customer.id);
                        });

                        return transactions.data;
                    });

                    return 0;
                }
            }

            if (response.status < 500) {
                router.replace("/");
            }

            return 0;
        },
        queryKey: ["transaction_list", date],
    });

    return (
        <div className="flex h-full w-full flex-col overflow-y-scroll">
            <div className="flex w-full p-2">
                <BoardDatePicker date={date} set_date={set_date} />
                <div className="flex flex-1 flex-row-reverse">
                    {props.children}
                </div>
            </div>
            {isFetching ? <div>LOADING DATA...</div> : null}
            <TransactionDisplay
                date={date.toString()}
                technician={props.tech}
                transactions={transactions}
            />
        </div>
    );
}
