import { data_error, is_data_error } from "~/server/data_error";
import {
    Account,
    Appointment,
    Closing,
    TransactionEntry,
} from "~/server/db_schema/type_def";
import { Query } from "../../server_queries_monad";
import { delete_appointment } from "../appointment/appointment_queries";
import { create_trasaction_date_entry } from "../../crud/transaction/transaction_date_entry";
import { create_customer_trasaction_history_entry } from "../../crud/transaction/customer_transaction_entry";

export const close_transaction: Query<
    { appointment: Appointment; account: Account; close: Closing },
    void
> = async ({ appointment, account, close }, f_db) => {
    const context = `closing appointment { ${appointment.id} : ${appointment.details} ${account.amount}(${account.tip}) } `;

    if (appointment.technician == null)
        return data_error(
            context,
            "appointment is not assigned to a technician",
        );

    const entry: TransactionEntry = {
        id: appointment.id,
        details: appointment.details,
        date: appointment.date,
        time: appointment.time,
        customer_id: appointment.customer.id,
        technician_id: appointment.technician.id,
        salon: appointment.salon,
        amount: account.amount,
        tip: account.tip,
        cash: close.cash,
        gift: close.gift,
        discount: close.discount,
    };

    const del_appointment = delete_appointment(appointment, f_db);
    const create_entry_query = create_trasaction_date_entry(entry, f_db);
    const create_history_query = create_customer_trasaction_history_entry(
        { customer_id: entry.customer_id, id: entry.id, date: entry.date },
        f_db,
    );

    const del = await del_appointment;
    if (is_data_error(del))
        return del.stack(context, "failed to delete appointment");

    const create_entry = await create_entry_query;
    if (is_data_error(create_entry)) return create_entry.stack(context, "...");

    const history = await create_history_query;
    if (is_data_error(history)) return history.stack(context, "...");
};
