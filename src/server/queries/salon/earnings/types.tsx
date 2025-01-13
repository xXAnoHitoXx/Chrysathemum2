import { data_error, DataError, is_data_error } from "~/server/data_error";
import { Account, Closing, Technician } from "~/server/db_schema/type_def";
import { to_account, to_closing } from "~/server/validation/db_types/accounting_validation";
import { to_technician } from "~/server/validation/db_types/technician_validation";
import { valiDate } from "~/server/validation/semantic/date";
import { is_object, is_string } from "~/server/validation/simple_type";

export type TechAccount = {
    tech: Technician;
    account: Account;
    date: string;
    closing: Closing;
};

export function to_tech_account(u: unknown): TechAccount | DataError {
    const context = "try casting to EntityAccount";
    if (!is_object(u)) return data_error(context, "not an object");

    if (!("date" in u && "tech" in u && "account" in u && "closing" in u))
        return data_error(context, "missing fields");

    const { date, tech, account, closing, } = u;

    const casted_date = valiDate(date);
    if (is_data_error(casted_date)) 
        return casted_date.stack(context, "date is not a valid date");

    const casted_account = to_account(account);

    if (is_data_error(casted_account))
        return casted_account.stack(context, "casting account");

    const casted_tech = to_technician(tech);

    if (is_data_error(casted_tech))
        return casted_tech.stack(context, "casting tech");

    const casted_closing = to_closing(closing);

    if (is_data_error(casted_closing))
        return casted_closing.stack(context, "cast closing");

    return { date: casted_date, tech: casted_tech, account: casted_account, closing: casted_closing };
}

export type EntityAccount = {
    id: string;
    account: Account;
    closing: Closing;
};

export function to_entity_account(u: unknown): EntityAccount | DataError {
    const context = "try casting to EntityAccount";
    if (!is_object(u)) return data_error(context, "not an object");

    if (!("id" in u && "account" in u && "closing" in u))
        return data_error(context, "missing fields");

    const { id, account, closing, } = u;

    if (!is_string(id)) return data_error(context, "id is not string");

    const casted_account = to_account(account);

    if (is_data_error(casted_account))
        return casted_account.stack(context, "cast account");

    const casted_closing = to_closing(closing);

    if (is_data_error(casted_closing))
        return casted_closing.stack(context, "cast closing");

    return { id: id, account: casted_account, closing: casted_closing, };
}
