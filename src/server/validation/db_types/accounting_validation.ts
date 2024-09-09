import { data_error, DataError, is_data_error } from "~/server/data_error";
import {
    Account,
    Appointment,
    Closing,
    Transaction,
} from "~/server/db_schema/type_def";
import { is_number, is_object } from "../simple_type";
import { to_appointment } from "./appointment_validation";
import { to_transaction } from "./transaction_validation";

export function to_account(t: unknown): Account | DataError {
    const context = "casting to Account";
    if (!is_object(t)) return data_error(context, "not an object");

    if (!("amount" in t && "tip" in t))
        return data_error(context, "missing fields");

    const { amount, tip } = t;

    if (!(is_number(amount) && is_number(tip)))
        return data_error(context, "wrong field types");

    return { amount: amount, tip: tip };
}

export function to_closing(t: unknown): Closing | DataError {
    const context = "casting to Closing";
    if (!is_object(t)) return data_error(context, "not an object");

    if (!("machine" in t && "cash" in t && "gift" in t && "discount" in t))
        return data_error(context, "missing fields");

    const { machine, cash, gift, discount } = t;

    if (
        !(
            is_number(machine) &&
            is_number(gift) &&
            is_number(cash) &&
            is_number(discount)
        )
    )
        return data_error(context, "wrong field types");

    return { machine: machine, cash: cash, gift: gift, discount: discount };
}

export function to_closing_info(
    t: unknown,
): { appointment: Appointment; close: Closing; account: Account } | DataError {
    const context = "casting to Closing info";

    if (!is_object(t)) return data_error(context, "not an object");

    if (!("appointment" in t && "close" in t && "account" in t))
        return data_error(context, "missing fields");

    const { appointment, close, account } = t;

    const appointment_casted = to_appointment(appointment);

    if (is_data_error(appointment_casted))
        return appointment_casted.stack(context, "...");

    const close_casted = to_closing(close);
    if (is_data_error(close_casted)) return close_casted.stack(context, "...");

    const account_casted = to_account(account);
    if (is_data_error(account_casted))
        return account_casted.stack(context, "...");

    return {
        appointment: appointment_casted,
        close: close_casted,
        account: account_casted,
    };
}

export function to_transaction_update_info(
    t: unknown,
): { transaction: Transaction; close: Closing; account: Account } | DataError {
    const context = "casting to Closing info";

    if (!is_object(t)) return data_error(context, "not an object");

    if (!("transaction" in t && "close" in t && "account" in t))
        return data_error(context, "missing fields");

    const { transaction, close, account } = t;

    const transaction_casted = to_transaction(transaction);

    if (is_data_error(transaction_casted))
        return transaction_casted.stack(context, "...");

    const close_casted = to_closing(close);
    if (is_data_error(close_casted)) return close_casted.stack(context, "...");

    const account_casted = to_account(account);
    if (is_data_error(account_casted))
        return account_casted.stack(context, "...");

    return {
        transaction: transaction_casted,
        close: close_casted,
        account: account_casted,
    };
}
