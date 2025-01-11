import { Account, EarningEntry } from "~/server/db_schema/type_def";
import { db_query, Query } from "../../server_queries_monad";
import { get, increment, update } from "firebase/database";
import { is_data_error } from "~/server/data_error";
import { to_account } from "~/server/validation/db_types/accounting_validation";
import { PATH_ACCOUNTING } from "~/server/db_schema/fb_schema";

export function accounting_entry(
    salon: string,
    date: string | null = null,
    entity: string | null = null,
): string[] {
    const a = [PATH_ACCOUNTING, salon];

    if (date == null) return a;
    a.push(date);

    if (entity == null) return a;
    a.push(entity);

    return a;
}

export const replace_earnings_of_date: Query<
    { date: string, entries: EarningEntry[] },
    void
> = async () => {
}

export const register_earnings: Query<
    EarningEntry,
    void
> = async ({ salon, entity, date, account: { amount, tip } }, f_db) => {
    const context = `register earnings for { ${entity} } on { ${date} } of { ${amount}(${tip}) }`;

    const ref = f_db.access(accounting_entry(salon, date));

    const updates: { [index: string]: unknown } = {};

    updates[`${entity}/amount`] = increment(amount);
    updates[`${entity}/tip`] = increment(tip);
    return db_query(context, update(ref, updates));
};

export const retrieve_earnings: Query<
    { salon: string; date: string; entity: string },
    Account
> = async ({ salon, date, entity }, f_db) => {
    const context = `Retrieving Earnings of { ${entity} } on { ${date} }`;

    const ref = f_db.access(accounting_entry(salon, date, entity));

    const data = await db_query(context, get(ref));
    if (is_data_error(data)) return data;

    const val = data.val();
    if (val == null) return { amount: 0, tip: 0 };

    const account = to_account(val);
    if (is_data_error(account))
        return account.stack(context, "corrupted entry");

    return account;
};
