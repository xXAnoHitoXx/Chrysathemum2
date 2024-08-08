import { unpack_response } from "~/app/api/server_parser";
import { report_error } from "~/server/data_error";
import { customer_name_search } from "~/server/queries/business/customer/customer_queries";
import { pack } from "~/server/queries/server_queries_monad";

export async function GET(
    _: Request,
    { params }: { params: { name: string } },
): Promise<Response> {
    const query = pack(params.name)
        .bind(customer_name_search)
        .bind(report_error);
    return unpack_response(query);
}
