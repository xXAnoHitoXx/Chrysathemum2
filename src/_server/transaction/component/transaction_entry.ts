import { DATES, PATH_ENTRIES, TRANSACTION_ROOT } from "~/_server/fire_db";
import {
    TransactionEntry,
    TransactionID,
    TransactionRecordID,
} from "../type_def";
import { ServerQuery } from "~/_server/server_query";
import { get, remove, set, update } from "firebase/database";
import { DataError } from "~/_server/data_error";

function transaction_entries(
    date: string,
    salon: string,
    id: string | null = null,
): string[] {
    const a = [DATES, date, TRANSACTION_ROOT, salon, PATH_ENTRIES];
    if (id != null) a.push(id);
    return a;
}

export const create_trasaction_date_entry: ServerQuery<TransactionEntry, void> =
    ServerQuery.create_query(async (params, f_db) => {
        const ref = transaction_entries(params.date, params.salon, params.id);

        try {
            await set(f_db.access(ref), params);
        } catch {
            return new DataError(
                `Creating TransactionEntry entry ${JSON.stringify(params)}`,
            );
        }
    });

export const retrieve_transaction_entries_on_date: ServerQuery<
    TransactionRecordID,
    (TransactionEntry | DataError)[]
> = ServerQuery.create_query(async ({ date, salon }, f_db) => {
    const context = "Retrieving transaction of ".concat(date);

    const ref = f_db.access(transaction_entries(date, salon));
    let data;
    try {
        data = await get(ref);
    } catch {
        return new DataError(context + " - db connection error");
    }

    if (!data.exists()) {
        return [];
    }

    const transactions: (TransactionEntry | DataError)[] = [];

    data.forEach((child) => {
        const transaction = TransactionEntry.safeParse(child.val());
        if (transaction.success) {
            transactions.push(transaction.data);
        } else {
            transactions.push(new DataError(context + " - corrupted entry"));
        }
    });

    return transactions;
});

export const retrieve_transaction_entry: ServerQuery<
    TransactionID,
    TransactionEntry
> = ServerQuery.create_query(async ({ date, entry_id, salon }, f_db) => {
    const context = `Retrieving transaction entry { ${entry_id} } `;
    let data;
    try {
        data = await get(
            f_db.access(transaction_entries(date, salon, entry_id)),
        );
    } catch {
        return new DataError(context + " - db connection error");
    }

    if (!data.exists()) {
        return new DataError(context + " - does not exist");
    }

    const e = TransactionEntry.safeParse(data.val());
    if (e.success) {
        return e.data;
    } else {
        return new DataError(context + " - corrupted entry");
    }
});

export const update_transaction_date_entry: ServerQuery<
    TransactionEntry,
    void
> = ServerQuery.create_query(async (entry, f_db) => {
    const ref = transaction_entries(entry.date, entry.salon, entry.id);
    try {
        await update(f_db.access(ref), entry);
    } catch {
        return new DataError("Update TransactionEntry - db error");
    }
});

export const delete_transaction_date_entry: ServerQuery<TransactionID, void> =
    ServerQuery.create_query(async ({ date, entry_id, salon }, f_db) => {
        const ref = f_db.access(transaction_entries(date, salon, entry_id));
        try {
            await remove(ref);
        } catch {
            return new DataError(`Removing Transaction Entry {${entry_id}}`);
        }
    });
