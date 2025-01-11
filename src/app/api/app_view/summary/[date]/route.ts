import { unpack_response } from "~/app/api/server_parser";
import { get_bisquit } from "~/server/queries/crud/biscuits";
import { retrieve_earnings_information_of_date } from "~/server/queries/earnings/mod";
import { pack } from "~/server/queries/server_queries_monad";
import { Bisquit } from "~/server/validation/bisquit";

export async function GET(
    _: Request,
    { params }: { params: Promise<{ date: string }> },
) {
    const { date } = await params;

    const query = pack(Bisquit.salon_selection)
        .bind(get_bisquit)
        .bind((salon) => ({ salon: salon, date: date }))
        .bind(retrieve_earnings_information_of_date)

    return unpack_response(query);
}
