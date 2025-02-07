import { AppointmentQuery } from "../appointment/appointment_queries";
import { Appointment } from "../appointment/type_def";
import { Customer, CustomerId } from "../customer/type_def";
import { DataError, is_data_error, report_partial_errors } from "../data_error";
import { array_query, ServerQuery } from "../server_query";
import { retrieve_all_technician_entries } from "../technician/components/technician_entry";
import { Technician } from "../technician/type_def";
import {
    create_customer_trasaction_history_entry,
    retrieve_customer_transactions_history,
} from "./component/customer_history";
import {
    create_trasaction_date_entry,
    retrieve_transaction_entries_on_date,
    retrieve_transaction_entry,
    update_transaction_date_entry,
} from "./component/transaction_entry";
import {
    AppointmentClosingData,
    CustomerHistoryIndex,
    Transaction,
    TransactionEntry,
    TransactionRecordID,
} from "./type_def";
import { retrieve_customer_entry } from "../customer/components/customer_entry";
import { invalidate_earnings_information_of_date } from "../earnings/components/salon";
import { EarningRecordID } from "../earnings/type_def";
import { bubble_sort } from "~/util/sorter/ano_bubble_sort";

export class TransactionQuery {
    public static close_transaction: ServerQuery<AppointmentClosingData, void> =
        ServerQuery.from_builder(({ appointment, account }, _) =>
            ServerQuery.create_query((closing_data: AppointmentClosingData) => {
                const context = `closing appointment { ${appointment.id} : ${appointment.details} ${account.amount}(${account.tip}) } `;

                if (closing_data.appointment.technician === undefined) {
                    return new DataError(
                        context + " - not assigned a technician",
                    );
                }
                const entry: TransactionEntry = {
                    id: closing_data.appointment.id,
                    details: closing_data.appointment.details,
                    date: closing_data.appointment.date,
                    time: closing_data.appointment.time,
                    customer_id: closing_data.appointment.customer.id,
                    technician_id: closing_data.appointment.technician.id,
                    salon: closing_data.appointment.salon,
                    amount: closing_data.account.amount,
                    tip: closing_data.account.tip,
                    cash: closing_data.closing.cash,
                    gift: closing_data.closing.gift,
                    discount: closing_data.closing.discount,
                };
                return entry;
            })
                .chain(create_trasaction_date_entry)
                .chain<Appointment>(() => appointment)
                .chain(AppointmentQuery.delete_appointment)
                .chain<CustomerHistoryIndex>(() => {
                    return {
                        customer_id: appointment.customer.id,
                        transaction_id: appointment.id,
                        date: appointment.date,
                        salon: appointment.salon,
                    };
                })
                .chain(create_customer_trasaction_history_entry)
                .chain<EarningRecordID>(() => {
                    return {
                        salon: appointment.salon,
                        date: appointment.date,
                    };
                })
                .chain(invalidate_earnings_information_of_date),
        );

    public static retrieve_customer_history: ServerQuery<
        Customer,
        Transaction[]
    > = ServerQuery.from_builder((customer, f_db) => {
        const context = `retriving transactions of customer { ${customer.name} }`;
        const technicians_query = retrieve_all_technician_entries
            .chain<Technician[]>(report_partial_errors)
            .chain<Record<string, Technician>>((technicians: Technician[]) => {
                const rec: Record<string, Technician> = {};
                for (const technician of technicians) {
                    rec[technician.id] = technician;
                }
                return rec;
            })
            .call(undefined as void, f_db);

        return ServerQuery.create_query((customer: Customer) => {
            return { customer_id: customer.id };
        })
            .chain<(CustomerHistoryIndex | DataError)[]>(
                retrieve_customer_transactions_history,
            )
            .chain<CustomerHistoryIndex[]>(report_partial_errors)
            .chain<TransactionEntry[]>(
                array_query(
                    ServerQuery.create_query((index: CustomerHistoryIndex) => {
                        return {
                            date: index.date,
                            salon: index.salon,
                            entry_id: index.transaction_id,
                        };
                    }).chain<TransactionEntry>(retrieve_transaction_entry),
                ),
            )
            .chain<(Transaction | DataError)[]>(async (entries) => {
                const tech_map = await technicians_query;

                if (is_data_error(tech_map))
                    return tech_map.stack(
                        context + "unable to retrieve technicians",
                    );

                const transactions: (Transaction | DataError)[] = [];
                for (const entry of entries) {
                    const tech = tech_map[entry.technician_id];
                    if (tech !== undefined) {
                        transactions.push({
                            ...entry,
                            technician: tech,
                            customer: customer,
                        });
                    } else {
                        transactions.push(
                            new DataError(context + " - technician not found"),
                        );
                    }
                }

                return transactions;
            })
            .chain<Transaction[]>(report_partial_errors)
            .chain<Transaction[]>((transactions) => {
                bubble_sort(transactions, (a, b) => {
                    const comp = b.date.localeCompare(a.date);
                    if (comp !== 0) {
                        return comp;
                    }
                    return a.id.localeCompare(b.id);
                });
                return transactions.slice(0, 20);
            });
    });

    public static update_transaction: ServerQuery<Transaction, void> =
        ServerQuery.create_query((transaction: Transaction) => {
            const entry: TransactionEntry = {
                id: transaction.id,
                details: transaction.details,
                date: transaction.date,
                time: transaction.time,
                customer_id: transaction.customer.id,
                technician_id: transaction.technician.id,
                salon: transaction.salon,
                amount: transaction.amount,
                tip: transaction.tip,
                cash: transaction.cash,
                gift: transaction.gift,
                discount: transaction.discount,
            };
            return entry;
        }).chain(update_transaction_date_entry);

    public static retrieve_transactions_on_date: ServerQuery<
        TransactionRecordID,
        Transaction[]
    > = ServerQuery.from_builder(({ date }, f_db) => {
        const context = `retrieving transaction on {${date}}`;
        const technicians_query = retrieve_all_technician_entries
            .chain<Technician[]>(report_partial_errors)
            .chain<Record<string, Technician>>((technicians: Technician[]) => {
                const rec: Record<string, Technician> = {};
                for (const technician of technicians) {
                    rec[technician.id] = technician;
                }
                return rec;
            })
            .call(undefined as void, f_db);
        return retrieve_transaction_entries_on_date
            .chain<TransactionEntry[]>(report_partial_errors)
            .chain<(Transaction | DataError)[]>(
                ServerQuery.create_query(
                    async (entries: TransactionEntry[]) => {
                        const customers = await ServerQuery.create_query(
                            (entries: CustomerId[]) => {
                                const unique: CustomerId[] = [];
                                for (const entry of entries) {
                                    let found = false;
                                    for (const u of unique) {
                                        if (
                                            u.customer_id === entry.customer_id
                                        ) {
                                            found = true;
                                            break;
                                        }
                                    }
                                    if (!found) unique.push(entry);
                                }
                                return unique;
                            },
                        )
                            .chain<Customer[]>(
                                array_query(retrieve_customer_entry),
                            )
                            .chain<Record<string, Customer>>((customers) => {
                                const rec: Record<string, Customer> = {};
                                for (const customer of customers) {
                                    rec[customer.id] = customer;
                                }
                                return rec;
                            })
                            .call(entries, f_db);

                        if (is_data_error(customers))
                            return customers.stack(
                                context + "unable to retrive customers",
                            );

                        const tech_map = await technicians_query;

                        if (is_data_error(tech_map))
                            return tech_map.stack(
                                context + "unable to retrieve technicians",
                            );

                        const transactions: (Transaction | DataError)[] = [];

                        for (const entry of entries) {
                            const tech = tech_map[entry.technician_id];
                            const customer = customers[entry.customer_id];

                            if (tech === undefined) {
                                transactions.push(
                                    new DataError(
                                        context + " - technician not found",
                                    ),
                                );
                            } else if (customer === undefined) {
                                transactions.push(
                                    new DataError(
                                        context + " - customer not found",
                                    ),
                                );
                            } else {
                                transactions.push({
                                    ...entry,
                                    technician: tech,
                                    customer: customer,
                                });
                            }
                        }
                        return transactions;
                    },
                ),
            )
            .chain<Transaction[]>(report_partial_errors);
    });
}
