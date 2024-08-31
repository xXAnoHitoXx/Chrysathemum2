import { pack } from "~/server/queries/server_queries_monad";
import { parse_request } from "../../server_parser";
import { to_closing_info } from "~/server/validation/db_types/accounting_validation";
import { close_transaction } from "~/server/queries/business/transaction/transaction_queries";

export async function POST(
    request: Request,
) {
    const query = pack(request)
    .bind(parse_request(to_closing_info))
    .bind(close_transaction)
}
