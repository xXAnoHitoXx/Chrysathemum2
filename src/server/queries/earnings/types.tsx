import { data_error, DataError, is_data_error } from "~/server/data_error";
import { Account } from "~/server/db_schema/type_def";
import { to_account } from "~/server/validation/db_types/accounting_validation";
import { is_object, is_string } from "~/server/validation/simple_type";

export type EntityAccount = {
    id: string,
    account: Account,
}

export function to_entity_account(u: unknown): EntityAccount | DataError {
    const context = "try casting to EntityAccount";
    if (!is_object(u)) return data_error(context, "not an object");

    if (!("id" in u && "account" in u))
        return data_error(context, "missing fields");

    const { id, account } = u;

    if (!is_string(id))
        return data_error(context, "id is not string");

    const casted_account = to_account(account);

    if (is_data_error(casted_account))
        return data_error(context, "id is not string");

    return { id: id, account: casted_account };
}
