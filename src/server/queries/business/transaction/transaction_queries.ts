import { NOT_IMPLEMENTED } from "~/server/data_error";
import { Account, Appointment, Closing } from "~/server/db_schema/type_def";
import { Query } from "../../server_queries_monad";

export const close_transaction: Query<
    { appointment: Appointment; account: Account; close: Closing },
    void
> = async ({ appointment, account, close }) => {};
export const register_sale = NOT_IMPLEMENTED;
