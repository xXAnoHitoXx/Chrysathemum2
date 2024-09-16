"use client";

import { BoardDatePicker } from "../_components/date_picker";
import { current_date } from "~/server/validation/semantic/date";
import { Technician, Transaction } from "~/server/db_schema/type_def";
import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Method } from "~/app/api/api_query";
import { handle_react_query_response } from "~/app/api/response_parser";
import { to_array } from "~/server/validation/simple_type";
import { to_transaction } from "~/server/validation/db_types/transaction_validation";
import {
    ErrorMessage_BisquitRetrival,
    ErrorMessage_DoesNotExist,
} from "~/server/error_messages/messages";
import { quick_sort } from "~/util/ano_quick_sort";
import { TransactionDisplay } from "./_daily_record/transaction_display";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { CalendarDate } from "@internationalized/date";
import { TransactionUpdate } from "./_daily_record/update";
import { TaxRate } from "~/constants";

const rec_view_transaction = "/api/app_view/daily_record/";

const useTransactionList = (
    date: string,
    saved_transactions: Transaction[],
    reset_filter: () => void,
): [Transaction[], Dispatch<SetStateAction<Transaction[]>>, boolean] => {
    const [transactions, set_transactions] =
        useState<Transaction[]>(saved_transactions);
    const router = useRouter();

    const { isFetching } = useQuery({
        queryFn: () => {
            console.log("fetching");
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

                            const cid_diff = a.customer.id.localeCompare(
                                b.customer.id,
                            );
                            if (cid_diff != 0) return cid_diff;

                            return a.technician.id.localeCompare(
                                b.technician.id,
                            );
                        });
                        set_transactions(transactions);
                        reset_filter();
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
                    },
                ),
            );
        },
        queryKey: ["transaction_list", date],
    });

    return [transactions, set_transactions, isFetching];
};

export type DailyRecordSaveState = {
    data: {
        transactions: Transaction[];
        filter: string[];
        date: CalendarDate;
    };
};

export const daily_record_default_save: DailyRecordSaveState = {
    data: {
        transactions: [],
        filter: [],
        date: current_date(),
    },
};

function Update(props: {
    transaction: Transaction;
    on_complete: (transaction: Transaction) => void;
}) {
    const edit_data = { ...props.transaction };

    return (
        <>
            <TransactionDisplay
                on_click={() => {}}
                transactions={[props.transaction]}
            />
            <TransactionUpdate
                transaction={edit_data}
                on_complete={props.on_complete}
            />
        </>
    );
}

export function DailyRecordView(props: {
    return: () => void;
    saves: DailyRecordSaveState;
}) {
    const [date, set_date] = useState(props.saves.data.date);
    const [transactions, _, isFetching] = useTransactionList(
        date.toString(),
        props.saves.data.transactions,
        () => set_filter([]),
    );
    const [filter, set_filter] = useState<string[]>(props.saves.data.filter);
    const [selection, set_selection] = useState<string[]>([]);

    const [editing, set_editing] = useState<Transaction | null>(null);

    useEffect(() => {
        props.saves.data = {
            transactions: transactions,
            date: date,
            filter: filter,
        };
    }, [date, transactions, filter]);

    const ids: string[] = [];
    const technicians: Technician[] = [];

    for (let i = 0; i < transactions.length; i++) {
        const transaction = transactions[i];
        if (
            transaction != undefined &&
            !ids.includes(transaction.technician.id)
        ) {
            ids.push(transaction.technician.id);
            technicians.push(transaction.technician);
        }
    }

    async function update_transaction(transaction: Transaction) {
        if (editing == null) return;

        editing.details = transaction.details;
        editing.amount = transaction.amount;
        editing.tip = transaction.tip;
        editing.cash = transaction.cash;
        editing.gift = transaction.gift;
        editing.discount = transaction.discount;

        await fetch(rec_view_transaction + date, {
            method: Method.PATCH,
            cache: "no-store",
            body: JSON.stringify({
                transaction: editing,
                account: {
                    amount: transaction.amount,
                    tip: transaction.tip,
                },
                close: {
                    machine:
                        Math.round(transaction.amount * TaxRate) +
                        transaction.tip -
                        transaction.cash -
                        transaction.gift -
                        transaction.discount,
                    cash: transaction.cash,
                    gift: transaction.gift,
                    discount: transaction.discount,
                },
            }),
        }).finally(() => {
            set_editing(null);
        });
    }

    return (
        <div className="flex w-full flex-1 flex-col">
            <div className="flex w-full">
                {editing == null ? (
                    <>
                        <BoardDatePicker date={date} set_date={set_date} />
                        <div className="flex flex-1 flex-row-reverse">
                            <Button
                                color="danger"
                                size="md"
                                isDisabled={
                                    filter.length === 0 &&
                                    selection.length === 0
                                }
                                onClick={props.return}
                            >
                                Return
                            </Button>
                            <Button
                                color="primary"
                                size="md"
                                isDisabled={
                                    filter.length === 0 &&
                                    selection.length === 0
                                }
                                onClick={
                                    filter.length === 0
                                        ? () => {
                                              set_filter(selection);
                                          }
                                        : () => {
                                              set_selection([]);
                                              set_filter([]);
                                          }
                                }
                            >
                                {filter.length === 0
                                    ? "Confirm"
                                    : "Reset Filter"}
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-1 flex-row-reverse">
                        <Button
                            color="danger"
                            size="md"
                            onClick={() => {
                                set_editing(null);
                            }}
                        >
                            Return
                        </Button>
                    </div>
                )}
            </div>
            {isFetching ? <div>LOADING DATA...</div> : null}

            {editing != null ? (
                <Update
                    transaction={editing}
                    on_complete={update_transaction}
                />
            ) : filter.length === 0 ? (
                <>
                    <div className="flex w-full overflow-x-auto">
                        {technicians
                            .filter((tech) => selection.includes(tech.id))
                            .map((tech) => (
                                <button
                                    className={"border-2".concat(
                                        " ",
                                        tech.color,
                                        " ",
                                        "h-20 w-32 rounded-3xl",
                                    )}
                                    onClick={() => {
                                        set_selection([
                                            ...selection.filter(
                                                (id) => id !== tech.id,
                                            ),
                                        ]);
                                    }}
                                >
                                    {tech.name}
                                </button>
                            ))}
                    </div>
                    <div className="flex w-full overflow-x-auto">
                        <button
                            className="h-20 w-32 rounded-3xl border-2 border-black text-black"
                            onClick={() => {
                                set_selection(
                                    technicians.map((tech) => tech.id),
                                );
                            }}
                        >
                            All
                        </button>
                        {technicians
                            .filter((tech) => !selection.includes(tech.id))
                            .map((tech) => (
                                <button
                                    className={"border-2".concat(
                                        " ",
                                        tech.color,
                                        " ",
                                        "h-20 w-32 rounded-3xl",
                                    )}
                                    onClick={() => {
                                        set_selection([...selection, tech.id]);
                                    }}
                                >
                                    {tech.name}
                                </button>
                            ))}
                    </div>
                </>
            ) : (
                <TransactionDisplay
                    on_click={set_editing}
                    transactions={transactions.filter((transaction) =>
                        filter.includes(transaction.technician.id),
                    )}
                />
            )}
        </div>
    );
}
