import { data_error, DataError } from "~/server/data_error";
import { Account } from "~/server/db_schema/type_def";
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
