import { pack } from "~/server/queries/server_queries_monad";
import { parse_request, unpack_response } from "../server_parser";
import { to_customer_creation_info } from "~/server/validation/db_types/customer_validation";
import { create_new_customer } from "~/server/queries/business/customer/customer_queries";

export async function POST(request: Request): Promise<Response> {
    const query = pack(request)
        .bind(parse_request(to_customer_creation_info))
        .bind(create_new_customer);
    return unpack_response(query);
}
