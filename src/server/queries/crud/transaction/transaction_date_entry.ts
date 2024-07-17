import { TransactionEntry } from "~/server/db_schema/type_def";
import { db_query, Query } from "../../server_queries_monad";
import { to_transaction } from "~/server/validation/db_types/transaction_validation";
import { data_error, DataError, is_data_error, lotta_errors, PartialResult } from "~/server/data_error";
import { get, remove, set, update } from "firebase/database";

export const create_trasaction_date_entry: Query<TransactionEntry, void> = async (params, f_db) => {
    const context = "Creating TransactionEntry entry"
    const ref = f_db.transaction_date_entries([params.date.toString(), params.id])
    return db_query(context, set(ref, params));
}

export const retrieve_transactions_on_date: Query<{ date: string }, PartialResult<TransactionEntry[]>> = 
    async ({ date }, f_db) => {
        const context = "Retrieving transaction of ".concat(date);

        const ref = f_db.transaction_date_entries([date]);
        const data = await db_query(context, get(ref));
        if (is_data_error(data)) return data;

        if(!data.exists()){
            return { data: [], error: null };
        }

        const transactions: TransactionEntry[] = [];
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

export const retrieve_transaction_entry: Query<{ date: string, id: string }, TransactionEntry> =
    async ({ date, id }, f_db) => {
        const context = "Retrieving transaction entry { ".concat(id, " }");
        const data = await db_query(context, get(f_db.transaction_date_entries([date, id])));
        if(is_data_error(data)) return data;

        if(!data.exists()){
            return data_error(context, "retrieving non existing TransactionEntry {".concat(id, "}"));
        }

        const e = to_transaction(data.val());
        if(is_data_error(e)) return e.stack(context, "corrupted entry");
        return e;
    }

export const update_transaction_date_entry: Query<TransactionEntry, void> = 
    async (transaction, f_db) => {
        const ref = f_db.transaction_date_entries([transaction.date.toString(), transaction.id]);
        return db_query("Update TransactionEntry entry", update(ref, transaction));
    }

export const delete_transaction_date_entry : Query<{ date: string, id: string }, void> =
    async ({ date, id }, f_db) => {
        const ref = f_db.transaction_date_entries([date, id]);
        return db_query("Remove TransactionEntry entry", remove(ref));
    }
