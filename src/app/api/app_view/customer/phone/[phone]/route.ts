import { unpack_response } from "~/app/api/server_parser";
import { handle_partial_errors } from "~/server/data_error";
import { customer_phone_search } from "~/server/queries/business/customer/customer_queries";
import { pack } from "~/server/queries/server_queries_monad";
import { require_permission, Role } from "~/app/api/c_user";

export async function GET(
    _: Request,
    { params }: { params: { phone: string } },
): Promise<Response> {
    await require_permission([Role.Operator, Role.Admin]).catch(() => {
        return Response.error();
    });

    const query = pack(params.phone)
        .bind(customer_phone_search)
        .bind(handle_partial_errors);
    return unpack_response(query);
}
