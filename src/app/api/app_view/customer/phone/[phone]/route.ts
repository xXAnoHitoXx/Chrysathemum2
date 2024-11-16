import { unpack_response } from "~/app/api/server_parser";
import { handle_partial_errors } from "~/server/data_error";
import { customer_phone_search } from "~/server/queries/business/customer/customer_queries";
import { pack } from "~/server/queries/server_queries_monad";

export async function GET(
    _: Request,
    { params }: { params: { phone: string } },
): Promise<Response> {
    const query = pack(params.phone)
        .bind(customer_phone_search)
        .bind(handle_partial_errors);
    return unpack_response(query);
}
