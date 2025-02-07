import { get, remove, set } from "firebase/database";
import { ACCOUNTING_ROOT } from "../../fire_db";
import { ServerQuery } from "../../server_query";
import {
    EarningEntry,
    EarningEntryCreationInfo,
    EarningRecordID,
} from "../type_def";
import { z } from "zod";
import { Transaction } from "~/server/transaction/type_def";
import { TaxRate } from "~/constants";
import { TransactionQuery } from "~/server/transaction/transaction_queries";
import { DataError } from "~/server/data_error";

function accounting_entry(salon: string, date: string): string[] {
    const a = [ACCOUNTING_ROOT, salon, date];
    return a;
}

export const retrieve_earnings_information_of_date: ServerQuery<
    EarningRecordID,
    EarningEntry[]
> = ServerQuery.from_builder((input: EarningRecordID) =>
    retrieve_stored_entry.chain<EarningEntry[]>(
        async (entries: EarningEntry[] | null, f_db) => {
            if (entries !== null) return entries;

            return TransactionQuery.retrieve_transactions_on_date
                .chain<EarningEntry[]>(extract_earning_information)
                .chain<EarningEntry[]>(
                    ServerQuery.from_builder((entries: EarningEntry[]) =>
                        ServerQuery.create_query((entries: EarningEntry[]) => {
                            return {
                                ...input,
                                entries: entries,
                            };
                        })
                            .chain(set_earnings_information_of_date)
                            .chain<EarningEntry[]>(() => entries),
                    ),
                )
                .call(input, f_db);
        },
    ),
);

export const invalidate_earnings_information_of_date: ServerQuery<
    EarningRecordID,
    void
> = ServerQuery.create_query(async ({ salon, date }, f_db) => {
    const ref = f_db.access(accounting_entry(salon, date));

    try {
        await remove(ref);
    } catch {
        return new DataError(
            `invalidating earnings of date ${date} - db error`,
        );
    }
});

const set_earnings_information_of_date: ServerQuery<
    EarningEntryCreationInfo,
    void
> = ServerQuery.create_query(async (info, f_db) => {
    const ref = f_db.access(accounting_entry(info.salon, info.date));

    try {
        await set(ref, info.entries);
    } catch {
        return new DataError(`set earnings of ${info.date}`);
    }
});

const extract_earning_information: ServerQuery<Transaction[], EarningEntry[]> =
    ServerQuery.create_query((transactions) => {
        const entries_map: Record<string, EarningEntry> = {};

        const earnings: EarningEntry[] = [];

        for (const transaction of transactions) {
            const entry = entries_map[transaction.technician.id];
            if (entry == undefined) {
                const account = {
                    id: transaction.technician.id,
                    account: {
                        amount: transaction.amount,
                        tip: transaction.tip,
                    },
                    closing: {
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
                };

                entries_map[transaction.technician.id] = account;
                earnings.push(account);
            } else {
                const account = entry.account;
                entry.account = {
                    amount: account.amount + transaction.amount,
                    tip: account.tip + transaction.tip,
                };
                entry.closing = {
                    machine:
                        entry.closing.machine +
                        Math.round(transaction.amount * TaxRate) +
                        transaction.tip -
                        transaction.cash -
                        transaction.gift -
                        transaction.discount,
                    cash: entry.closing.cash + transaction.cash,
                    gift: entry.closing.gift + transaction.gift,
                    discount: entry.closing.discount + transaction.discount,
                };
            }
        }

        return earnings;
    });

const retrieve_stored_entry: ServerQuery<
    EarningRecordID,
    EarningEntry[] | null
> = ServerQuery.create_query(async ({ salon, date }, f_db) => {
    const context = "retrieve stored entry";
    const ref = f_db.access(accounting_entry(salon, date));

    let data;
    try {
        data = await get(ref);
    } catch {
        return new DataError(context + " - db error");
    }

    if (!data.exists()) {
        return null;
    }

    const e = z.array(EarningEntry).safeParse(data.val());

    if (e.success) {
        return e.data;
    } else {
        return null;
    }
});
