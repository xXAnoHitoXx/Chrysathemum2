import { ServerQuery } from "~/_server/server_query";
import { CustomerHistoryIndex, TransactionRecordID } from "../type_def";
import { CUSTOMER_ROOT, HISTORY } from "~/_server/fire_db";
import { get, remove, set } from "firebase/database";
import { DataError } from "~/_server/data_error";
import { CustomerId } from "~/_server/customer/type_def";

function customers_history(
    customer_id: string,
    transaction_id: string | null = null,
): string[] {
    return transaction_id === null
        ? [CUSTOMER_ROOT, HISTORY, customer_id]
        : [CUSTOMER_ROOT, HISTORY, customer_id, transaction_id];
}

export const create_customer_trasaction_history_entry: ServerQuery<
    CustomerHistoryIndex,
    void
> = ServerQuery.create_query(
    async ({ customer_id, transaction_id, date, salon }, f_db) => {
        const context = "Creating Customer Transaction History entry";

        const ref = f_db.access(customers_history(customer_id, transaction_id));

        try {
            await set(ref, { date: date, salon: salon });
        } catch {
            return new DataError(context + " - db error");
        }
    },
);

export const retrieve_customer_transactions_history: ServerQuery<
    CustomerId,
    (CustomerHistoryIndex | DataError)[]
> = ServerQuery.create_query(async ({ customer_id }, f_db) => {
    const context = "Retrieving transaction history of ".concat(customer_id);

    const ref = f_db.access(customers_history(customer_id));
    let data;
    try {
        data = await get(ref);
    } catch {
        return new DataError(context + " - db error");
    }

    if (!data.exists()) {
        return [];
    }

    const transactions: (CustomerHistoryIndex | DataError)[] = [];

    data.forEach((child) => {
        const record = TransactionRecordID.safeParse(child.val());
        if (record.success) {
            transactions.push({
                ...record.data,
                customer_id: customer_id,
                transaction_id: child.key,
            });
        } else {
            transactions.push(
                new DataError(`${context} - ${child.key} is corrupted`),
            );
        }
    });

    return transactions;
});

export const delete_customers_transaction_history_entry: ServerQuery<
    CustomerHistoryIndex,
    void
> = ServerQuery.create_query(async ({ customer_id, transaction_id }, f_db) => {
    const ref = f_db.access(customers_history(customer_id, transaction_id));
    try {
        await remove(ref);
    } catch {
        return new DataError("Remove Transaction entry - db error");
    }
});
