"use client";

import { Button } from "@heroui/button";
import { useQuery } from "@tanstack/react-query";
import { Method } from "~/app/api/api_query";
import { TransactionDisplay } from "./_daily_record/transaction_display";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { CalendarDate } from "@internationalized/date";
import { TransactionUpdate } from "./_daily_record/update";
import { Transaction } from "~/server/transaction/type_def";
import { z } from "zod";
import { quick_sort } from "~/util/sorter/ano_quick_sort";
import { current_date } from "~/util/date";
import { Technician } from "~/server/technician/type_def";
import { BoardDatePicker } from "~/app/_components/ui_elements/date_picker";

const rec_view_transaction = "/api/app_view/daily_record/";

const useTransactionList = (
    date: string,
    saved_transactions: Transaction[],
    reset_filter: () => void,
): [Transaction[], Dispatch<SetStateAction<Transaction[]>>, boolean] => {
    const [transactions, set_transactions] =
        useState<Transaction[]>(saved_transactions);

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
                    quick_sort(transactions.data, (a, b) => {
                        const time_diff = b.time - a.time;
                        if (time_diff != 0) return time_diff;

                        const cid_diff = a.customer.id.localeCompare(
                            b.customer.id,
                        );
                        if (cid_diff != 0) return cid_diff;

                        return a.technician.id.localeCompare(b.technician.id);
                    });
                    set_transactions(transactions.data);
                    reset_filter();
                    return true;
                }
            }
            return false;
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
    const [transactions, set_transactions, isFetching] = useTransactionList(
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
        await fetch(rec_view_transaction + date, {
            method: Method.PATCH,
            cache: "no-store",
            body: JSON.stringify(transaction),
        });
            
        set_transactions((transactions) => transactions.map((tr) => {
            if (tr.id === transaction.id) {
                return transaction;
            }
            return tr;
        }));
        set_editing(null);
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
                                onPress={props.return}
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
                                onPress={
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
                            onPress={() => {
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
