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
    Customer,
    Technician,
    Transaction,
    TransactionEntry,
} from "~/server/db_schema/type_def";
import { Query } from "../../server_queries_monad";
import { delete_appointment } from "../appointment/appointment_queries";
import {
    create_trasaction_date_entry,
    retrieve_transaction_entries_on_date,
    retrieve_transaction_entry,
    update_transaction_date_entry,
} from "../../crud/transaction/transaction_date_entry";
import {
    create_customer_trasaction_history_entry,
    retrieve_customer_transactions_history,
} from "../../crud/transaction/customer_transaction_entry";
import { get_all_technicians } from "../technician/technician_queries";
import { retrieve_customer_entry } from "../../crud/customer/customer_entry";
import { register_earnings } from "../../crud/accounting/earning";
import { iter, take } from "itertools";
import { quick_sort } from "~/util/ano_quick_sort";

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
        {
            customer_id: entry.customer_id,
            id: entry.id,
            date: entry.date,
            salon: entry.salon,
        },
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

export const retrieve_customer_history: Query<
    Customer,
    PartialResult<Transaction[]>
> = async (customer, f_db) => {
    const context = `retriving transactions of customer { ${customer.name} }`;

    const v: void = undefined;
    const technician_query = get_all_technicians(v, f_db);

    const index = await retrieve_customer_transactions_history(
        { customer_id: customer.id },
        f_db,
    );

    if (is_data_error(index)) return index.stack(context, "...");

    const errors: DataError[] = index.error != null ? [index.error] : [];

    const query: (
        | Promise<TransactionEntry | DataError>
        | TransactionEntry
        | DataError
    )[] = [];

    for (const data of index.data) {
        query.push(retrieve_transaction_entry(data, f_db));
    }

    const transaction_entries: TransactionEntry[] = [];

    (await Promise.all(query)).map((res: TransactionEntry | DataError) => {
        if (is_data_error(res)) {
            errors.push(res);
        } else {
            transaction_entries.push(res);
        }
    });

    const technicians = await technician_query;

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

    for (let i = 0; i < transaction_entries.length; i++) {
        const entry = transaction_entries[i];
        if (entry == undefined) continue;

        const sub_context = `filling out appointment { ${entry.id} }`;

        if (is_data_error(customer)) {
            errors.push(
                customer.stack(
                    sub_context,
                    `error retrieving customer { ${entry.customer_id} }`,
                ),
            );
            continue;
        }

        if (entry.technician_id != null) {
            const tech = tech_map[entry.technician_id];

            if (tech != undefined) {
                transactions.push({
                    ...entry,
                    technician: tech,
                    customer: customer,
                });

                if (transactions.length >= 20) {
                    if (
                        transactions[
                            transactions.length - 1
                        ]!.date.localeCompare(
                            transactions[transactions.length - 2]!.date,
                        ) === 0
                    ) {
                        break;
                    }
                }
                continue;
            }
        }

        errors.push(
            data_error(
                context,
                `transactions {${entry.id}} missing technician {${entry.technician_id}}`,
            ),
        );
    }

    quick_sort(transactions, (t_a, t_b) => {
        const comp = t_a.date.localeCompare(t_b.date);
        if (comp !== 0) return comp;
        return t_a.time - t_b.time;
    });

    return {
        data: take(20, iter(transactions)),
        error:
            errors.length == 0
                ? null
                : lotta_errors(context, "encountered errors", errors),
    };
};

export const update_transaction: Query<
    { transaction: Transaction; account: Account; close: Closing },
    void
> = async ({ transaction, account, close }, f_db) => {
    const entry: TransactionEntry = {
        id: transaction.id,
        details: transaction.details,
        date: transaction.date,
        time: transaction.time,
        customer_id: transaction.customer.id,
        technician_id: transaction.technician.id,
        salon: transaction.salon,
        amount: account.amount,
        tip: account.tip,
        cash: close.cash,
        gift: close.gift,
        discount: close.discount,
    };

    const update_transaction_query = update_transaction_date_entry(entry, f_db);
    const register_earnings_query = register_earnings(
        {
            salon: entry.salon,
            date: entry.date,
            entity: entry.technician_id,
            account: {
                amount: account.amount - transaction.amount,
                tip: account.tip - transaction.tip,
            },
        },
        f_db,
    );

    const context = `Updating transaction ${transaction.id}`;

    const update = await update_transaction_query;
    if (is_data_error(update)) return update.stack(context, "...");

    const earnings = await register_earnings_query;
    if (is_data_error(earnings)) return earnings.stack(context, "...");
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
