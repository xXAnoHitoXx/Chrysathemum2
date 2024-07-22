import {
    data_error,
    is_data_error,
    NOT_IMPLEMENTED,
} from "~/server/data_error";
import {
    Account,
    Appointment,
    Closing,
    TransactionEntry,
} from "~/server/db_schema/type_def";
import { Query } from "../../server_queries_monad";
import { delete_appointment_entry } from "../../crud/appointment/appointment_entry";
import { delete_appointment } from "../appointment/appointment_queries";

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
    const del = await delete_appointment(appointment, f_db);

    if (is_data_error(del))
        return del.stack(context, "failed to delete appointment");

    const entry: TransactionEntry = {
        ...account,
        ...close,
        id: appointment.id,
        details: appointment.details,
        date: appointment.date,
        time: appointment.time,
        customer_id: appointment.customer.id,
        technician_id: appointment.technician.id,
    };
};
