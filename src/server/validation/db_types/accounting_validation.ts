import { data_error, DataError } from "~/server/data_error";
import { Account, Closing } from "~/server/db_schema/type_def";
import { is_number, is_object } from "../simple_type";

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
