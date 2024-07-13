import { Transaction } from "~/server/db_schema/type_def";
import { db_query, Query } from "../../server_queries_monad";
import { to_transaction } from "~/server/validation/db_types/transaction_validation";
import { DataError, is_data_error, lotta_errors, PartialResult } from "~/server/data_error";
import { get, remove, set, update } from "firebase/database";

export const create_trasaction_date_entry: Query<Transaction, void> = async (params, f_db) => {
    const context = "Creating Transaction entry"

    const ref = f_db.transaction_date_entries([params.date.toString(), params.id])

    const e = await db_query(context, set(ref, params));
    if(is_data_error(e)) return e;
}

export const retrieve_transactions_on_date: Query<{ date: string }, PartialResult<Transaction[]>> = 
    async ({ date }, f_db): Promise<PartialResult<Transaction[]> | DataError> => {
        const context = "Retrieving transaction of ".concat(date);

        const ref = f_db.transaction_date_entries([date]);
        const data = await db_query(context, get(ref));
        if (is_data_error(data)) return data;

        if(!data.exists()){
            return { data: [], error: null };
        }

        const transactions: Transaction[] = [];
        const error: DataError[] = [];

        data.forEach((child) => {
            const transaction = to_transaction(child.val());
            if (is_data_error(transaction)) {
                error.push(transaction.stack("Parsing { ".concat(child.key, " }"), "corrupted entry"));
                return;
            }
            transactions.push(transaction);
        });

        return {
            data: transactions,
            error: (error.length == 0)?
                null : lotta_errors(context, error.length.toString().concat(" corrupted entries"), error)
        };
    }

export const update_transaction_date_entry: Query<Transaction, void> = 
    async (transaction, f_db) => {
        const ref = f_db.transaction_date_entries([transaction.date.toString(), transaction.id]);
        return db_query("Update Transaction entry", update(ref, transaction))
    }

export const delete_transaction_date_entry : Query<{ date: string, id: string }, void> =
    async ({ date, id }, f_db) => {
        const ref = f_db.transaction_date_entries([date, id]);
        return db_query("Remove Transaction entry", remove(ref));
    }
