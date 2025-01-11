import { db_query, pack_nested, Query } from "../server_queries_monad";
import { get, remove, set } from "firebase/database";
import { handle_partial_errors, is_data_error } from "~/server/data_error";
import { PATH_ACCOUNTING } from "~/server/db_schema/fb_schema";
import { EntityAccount, to_entity_account } from "./types";
import { to_array } from "~/server/validation/simple_type";
import { retrieve_transactions_on_date } from "../business/transaction/transaction_queries";
import { Transaction } from "~/server/db_schema/type_def";

function accounting_entry(salon: string, date: string): string[] {
    const a = [PATH_ACCOUNTING, salon, date];
    return a;
}

export const set_earnings_information_of_date: Query<
    { salon: string; date: string; entries: EntityAccount[] },
    void
> = async ({ salon, date, entries }, f_db) => {
    const ref = f_db.access(accounting_entry(salon, date));

    const e = await db_query(
        `set earnings of date {${date}}`,
        set(ref, entries),
    );
    if (is_data_error(e)) return e;
};

export const retrieve_earnings_information_of_date: Query<
    { salon: string; date: string },
    EntityAccount[]
> = async (input, f_db) => {
    const context = `retrieve earnings of ${input.salon} on ${input.date}`;

    const query = pack_nested(input, f_db)
        .bind(retrieve_stored_entry)
        .bind((entries) => {
            if (entries != null) return entries;

            return pack_nested(input, f_db)
                .bind(retrieve_transactions_on_date)
                .bind(handle_partial_errors)
                .bind(extract_earning_information)
                .unpack();
        })
        .bind(async (accounts, f_db) => {
            const save = await pack_nested(
                { ...input, entries: accounts },
                f_db,
            )
                .bind(set_earnings_information_of_date)
                .unpack();

            if (is_data_error(save))
                return save.stack(context, "saving new earnings data");

            return accounts;
        });
    return query.unpack();
};

export const invalidate_earnings_information_of_date: Query<
    { salon: string; date: string },
    void
> = async ({ salon, date }, f_db) => {
    const ref = f_db.access(accounting_entry(salon, date));

    const e = await db_query(
        `invalidating earnings of date {${date}}`,
        remove(ref),
    );

    if (is_data_error(e)) return e;
};

const extract_earning_information: Query<Transaction[], EntityAccount[]> = (
    transactions,
) => {
    const shop = {
        id: "shop",
        account: {
            amount: 0,
            tip: 0,
        },
    };

    const entries_map: Record<string, EntityAccount> = {
        shop: shop,
    };

    const earnings: EntityAccount[] = [shop];

    for (const transaction of transactions) {
        shop.account.amount += transaction.amount;
        shop.account.tip += transaction.tip;

        const entry = entries_map[transaction.technician.id];
        if (entry == undefined) {
            const account = {
                id: transaction.technician.id,
                account: {
                    amount: transaction.amount,
                    tip: transaction.tip,
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
        }
    }

    return earnings;
};

const retrieve_stored_entry: Query<
    { salon: string; date: string },
    EntityAccount[] | null
> = async ({ salon, date }, f_db) => {
    const context = "retrieve stored entry";
    const ref = f_db.access(accounting_entry(salon, date));

    const data = await db_query(context, get(ref));

    if (is_data_error(data)) return data;

    if (!data.exists()) {
        return null;
    }

    const e = to_array(to_entity_account)(data.val());
    if (is_data_error(e)) return null;

    return e;
};
