import { handle_partial_errors } from "~/server/data_error";
import { retrieve_transactions_on_date } from "~/server/queries/business/transaction/transaction_queries";
import { get_bisquit } from "~/server/queries/crud/biscuits";
import { pack } from "~/server/queries/server_queries_monad";
import { Bisquit } from "~/server/validation/bisquit";
import { unpack_response } from "../../server_parser";

export async function GET(
    _: Request,
    { params }: { params: { date: string } },
) {
    const query = pack(Bisquit.salon_selection)
        .bind(get_bisquit)
        .bind((salon) => ({ salon: salon, date: params.date }))
        .bind(retrieve_transactions_on_date)
        .bind(handle_partial_errors);

    return unpack_response(query);
}
