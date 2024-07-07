import { Appointment, Transaction } from "~/server/db_schema/type_def";
import { Query } from "../../server_queries_monad";
import { is_server_error, server_error } from "~/server/server_error";
import { DataSnapshot, get, remove, set, update } from "firebase/database";
import { to_transaction } from "~/server/validation/db_types/transaction_validation";

export const create_trasaction_date_entry: Query<{
    appointment: Appointment,
    amount: number,
    tip: number,
    cash: number,
    gift: number,
    discount: number,
}, Transaction> = async (params, f_db) => {
    if (params.appointment.technician_id == null) return server_error("closing an Appointment without technician_id");

    const transaction: Transaction = {
        id: params.appointment.id,
        customer_id: params.appointment.customer_id,
        technician_id: params.appointment.technician_id,
        date: params.appointment.date,
        time: params.appointment.time,
        details: params.appointment.details,

        amount: params.amount,
        tip: params.tip,
        cash: params.cash,
        gift: params.gift,
        discount: params.discount,
    }

    const ref = f_db.transaction_date_entries([transaction.date, transaction.id])
    await set(ref, transaction); 

    return transaction;
}

export const retrieve_transactions_on_date: Query<{ date: string }, Transaction[]> = 
    async ({ date }, f_db) => {

        const ref = f_db.transaction_date_entries([date]);
        const data: DataSnapshot = await get(ref);

        if(!data.exists()){
            return [];
        }

        const transactions: Transaction[] = [];

        data.forEach((child) => {
            const transaction = to_transaction(child.val);
            if (!is_server_error(transaction)) {
                transactions.push(transaction);
            }
        });

        return server_error("not implemented");
    }

export const update_transaction_date_entry: Query<Transaction, void> = 
    async (transaction, f_db) => {
        const ref = f_db.transaction_date_entries([transaction.date, transaction.id]);
        await update(ref, transaction);
    }

export const delete_appointment_entry : Query<{ date: string, id: string }, void> =
    async ({ date, id }, f_db) => {
        const ref = f_db.transaction_date_entries([date, id]);
        await remove(ref);
    }
