import { is_data_error } from "~/server/data_error";
import { Closing } from "~/server/db_schema/type_def";
import { db_query, Query } from "../../server_queries_monad";
import { get, set } from "firebase/database";
import { to_closing } from "~/server/validation/db_types/accounting_validation";
import { PATH_DATES, PATH_TRANSACTIONS } from "~/server/db_schema/fb_schema";

const close = "close";

function closing_path(date: string, salon: string): string[] {
    const a = [PATH_DATES, date, PATH_TRANSACTIONS, salon, close];
    return a;
}

export const close_date: Query<
    { date: string; salon: string; closing: Closing },
    void
> = async ({ date, salon, closing }, f_db) => {
    const context = `close date { ${date} } at { ${salon} }`;

    const ref = f_db.access(closing_path(date, salon));
    return db_query(context, set(ref, closing));
};

export const retrieve_closing_data: Query<
    { date: string; salon: string },
    Closing
> = async ({ date, salon }, f_db) => {
    const context = `retrieve closing data of { ${date} } at { ${salon} }`;
    const ref = f_db.access(closing_path(date, salon));

    const data = await db_query(context, get(ref));
    if (is_data_error(data)) return data;

    const val = data.val();
    if (val == null) return { machine: 0, cash: 0, gift: 0, discount: 0 };

    return to_closing(val);
};
