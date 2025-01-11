import { parse_request, unpack_response } from "~/app/api/server_parser";
import { handle_partial_errors } from "~/server/data_error";
import {
    retrieve_transactions_on_date,
    update_transaction,
} from "~/server/queries/business/transaction/transaction_queries";
import { get_bisquit } from "~/server/queries/crud/biscuits";
import { array_query, pack } from "~/server/queries/server_queries_monad";
import { Bisquit } from "~/server/validation/bisquit";
import {
    to_earning_entry,
    to_transaction_update_info,
} from "~/server/validation/db_types/accounting_validation";
import { require_permission, Role } from "../../../c_user";
import { to_array } from "~/server/validation/simple_type";
import { register_earnings } from "~/server/queries/crud/accounting/earning";

export async function GET(
    _: Request,
    { params }: { params: Promise<{ date: string }> },
) {
    const { date } = await params;

    await require_permission([Role.Operator, Role.Admin]).catch(() => {
        return Response.error();
    });

    const query = pack(Bisquit.salon_selection)
        .bind(get_bisquit)
        .bind((salon) => ({ salon: salon, date: date }))
        .bind(retrieve_transactions_on_date)
        .bind(handle_partial_errors);

    return unpack_response(query);
}

export async function POST(
    request: Request,
    _: { params: Promise<{ date: string }> },
) {
    await require_permission([Role.Operator, Role.Admin]).catch(() => {
        return Response.error();
    });

    const query = pack(request)
        .bind(to_array(to_earning_entry))
        .bind(
            array_query(register_earnings, "daily record POST request", "..."),
        )
        .bind((result) => {
            if (result.error != null) {
                return result.error;
            }
        });

    return unpack_response(query);
}

export async function PATCH(request: Request) {
    await require_permission([Role.Operator, Role.Admin]).catch(() => {
        return Response.error();
    });

    const query = pack(request)
        .bind(parse_request(to_transaction_update_info))
        .bind(update_transaction);
    return unpack_response(query);
}
