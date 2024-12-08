import { pack } from "~/server/queries/server_queries_monad";
import {
    to_customer_creation_info,
    to_customer_update_info,
} from "~/server/validation/db_types/customer_validation";
import {
    create_new_customer,
    update_customer_info,
} from "~/server/queries/business/customer/customer_queries";
import { parse_request, unpack_response } from "../../server_parser";
import { require_permission, Role } from "~/app/api/c_user";

export async function POST(request: Request): Promise<Response> {
    await require_permission([Role.Operator, Role.Admin]).catch(() => {
        return Response.error();
    });

    const query = pack(request)
        .bind(parse_request(to_customer_creation_info))
        .bind(create_new_customer);
    return unpack_response(query);
}

export async function PATCH(request: Request): Promise<Response> {
    await require_permission([Role.Operator, Role.Admin]).catch(() => {
        return Response.error();
    });

    const query = pack(request)
        .bind(parse_request(to_customer_update_info))
        .bind(update_customer_info);
    return unpack_response(query);
}
