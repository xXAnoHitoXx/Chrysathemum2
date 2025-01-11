import { parse_request, unpack_response } from "~/app/api/server_parser";
import { handle_partial_errors } from "~/server/data_error";
import {
    retrieve_transactions_on_date,
    update_transaction,
} from "~/server/queries/business/transaction/transaction_queries";
import { get_bisquit } from "~/server/queries/crud/biscuits";
import { pack, pack_nested } from "~/server/queries/server_queries_monad";
import { Bisquit } from "~/server/validation/bisquit";
import { to_transaction_update_info } from "~/server/validation/db_types/accounting_validation";
import { require_permission, Role } from "../../../c_user";
import { invalidate_earnings_information_of_date } from "~/server/queries/earnings/mod";

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

export async function PATCH(request: Request) {
    await require_permission([Role.Operator, Role.Admin]).catch(() => {
        return Response.error();
    });

    const query = pack(request)
        .bind(parse_request(to_transaction_update_info))
        .bind((update_info, f_db) => {
            return pack_nested(update_info, f_db)
                .bind(update_transaction)
                .bind((_) => {
                    return {
                        salon: update_info.transaction.salon,
                        date: update_info.transaction.date,
                    };
                })
                .bind(invalidate_earnings_information_of_date)
                .unpack();
        });
    return unpack_response(query);
}
