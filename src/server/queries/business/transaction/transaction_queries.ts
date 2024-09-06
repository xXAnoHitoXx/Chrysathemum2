import {
    data_error,
    DataError,
    is_data_error,
    lotta_errors,
    PartialResult,
} from "~/server/data_error";
import {
    Account,
    Appointment,
    Closing,
    Technician,
    Transaction,
    TransactionEntry,
} from "~/server/db_schema/type_def";
import { Query } from "../../server_queries_monad";
import { delete_appointment } from "../appointment/appointment_queries";
import {
    create_trasaction_date_entry,
    retrieve_transaction_entries_on_date,
} from "../../crud/transaction/transaction_date_entry";
import { create_customer_trasaction_history_entry } from "../../crud/transaction/customer_transaction_entry";
import { get_all_technicians } from "../technician/technician_queries";
import { retrieve_customer_entry } from "../../crud/customer/customer_entry";
import { register_earnings } from "../../crud/accounting/earning";

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
    const register_earnings_query = register_earnings(
        {
            salon: entry.salon,
            date: entry.date,
            entity: entry.technician_id,
            account: { amount: entry.amount, tip: entry.tip },
        },
        f_db,
    );

    const del = await del_appointment;
    if (is_data_error(del))
        return del.stack(context, "failed to delete appointment");

    const create_entry = await create_entry_query;
    if (is_data_error(create_entry)) return create_entry.stack(context, "...");

    const history = await create_history_query;
    if (is_data_error(history)) return history.stack(context, "...");

    const register = await register_earnings_query;
    if (is_data_error(register)) return register.stack(context, "...");
};

export const retrieve_transactions_on_date: Query<
    { date: string; salon: string },
    PartialResult<Transaction[]>
> = async ({ date, salon }, f_db) => {
    const context = `retrieving transaction on {${date}}`;

    const entries = await retrieve_transaction_entries_on_date(
        { date, salon },
        f_db,
    );

    if (is_data_error(entries)) return entries.stack(context, "...");

    const errors: DataError[] = [];

    if (entries.error != null) errors.push(entries.error);

    const v: void = undefined;
    const technicians = await get_all_technicians(v, f_db);

    if (is_data_error(technicians))
        return technicians.stack(context, "unable to retrieve technicians");

    if (is_data_error(technicians.error)) {
        errors.push(technicians.error);
    }

    const tech_map: { [index: string]: Technician } = {};

    technicians.data.forEach((tech) => {
        tech_map[tech.id] = tech;
    });

    const transactions: Transaction[] = [];

    for (let i = 0; i < entries.data.length; i++) {
        const entry = entries.data[i];

        if (entry == null) {
            errors.push(data_error(context, "undefined in entry array"));
            continue;
        }

        const sub_context = `filling out transaction { ${entry.id} }`;

        const customer = await retrieve_customer_entry(
            { customer_id: entry.customer_id },
            f_db,
        );

        if (is_data_error(customer)) {
            errors.push(
                customer.stack(
                    sub_context,
                    `error retrieving customer { ${entry.customer_id} }`,
                ),
            );
            continue;
        }

        const tech = tech_map[entry.technician_id];

        if (tech != undefined) {
            transactions.push({
                ...entry,
                technician: tech,
                customer: customer,
            });
            continue;
        } else {
            errors.push(
                data_error(
                    sub_context,
                    `undefined technician {${entry.technician_id}}`,
                ),
            );
        }
    }

    return {
        data: transactions,
        error:
            errors.length === 0 ? null : lotta_errors(context, "...", errors),
    };
};
