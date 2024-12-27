"use client";

import { Technician } from "~/server/db_schema/type_def";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Method } from "~/app/api/api_query";
import { handle_react_query_response } from "~/app/api/response_parser";
import { BoardDatePicker } from "~/app/salon/app-view/_components/date_picker";
import { Transaction } from "~/server/db_schema/type_def";
import {
    ErrorMessage_BisquitRetrival,
    ErrorMessage_DoesNotExist,
} from "~/server/error_messages/messages";
import { to_transaction } from "~/server/validation/db_types/transaction_validation";
import { current_date } from "~/server/validation/semantic/date";
import { to_array } from "~/server/validation/simple_type";
import { quick_sort } from "~/util/ano_quick_sort";
import { TransactionDisplay } from "./transaction_display";

const rec_view_transaction = "/api/tech_view/";

export function TechDataDisplay(props: { tech: Technician }) {
    const [date, set_date] = useState(current_date());

    const [transactions, set_transactions] = useState<Transaction[]>([]);
    const router = useRouter();

    const { isFetching } = useQuery({
        queryFn: () => {
            return fetch(rec_view_transaction + date, {
                method: Method.GET,
                cache: "no-store",
            }).then(
                handle_react_query_response(
                    to_array(to_transaction),
                    (transactions) => {
                        quick_sort(transactions, (a, b) => {
                            const time_diff = b.time - a.time;
                            if (time_diff != 0) return time_diff;

                            return a.customer.id.localeCompare(b.customer.id);
                        });
                        set_transactions(transactions);
                        return true;
                    },
                    (error) => {
                        if (
                            error.contains([
                                ErrorMessage_BisquitRetrival,
                                ErrorMessage_DoesNotExist,
                            ])
                        ) {
                            router.replace("/");
                        }
                        return false;
                    },
                ),
            );
        },
        queryKey: ["transaction_list", date],
    });

    return (
        <div className="flex h-fit w-full flex-col">
            <div className="flex w-full">
                <BoardDatePicker date={date} set_date={set_date} />
            </div>
            {isFetching ? <div>LOADING DATA...</div> : null}
            <TransactionDisplay
                technician={props.tech}
                transactions={transactions}
            />
        </div>
    );
}
