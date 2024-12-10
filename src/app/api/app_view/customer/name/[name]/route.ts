import { unpack_response } from "~/app/api/server_parser";
import { handle_partial_errors } from "~/server/data_error";
import { customer_name_search } from "~/server/queries/business/customer/customer_queries";
import { pack } from "~/server/queries/server_queries_monad";
import { require_permission, Role } from "~/app/api/c_user";

export async function GET(
    _: Request,
    { params }: { params: Promise<{ name: string }> },
): Promise<Response> {
    const { name } = await params;

    await require_permission([Role.Operator, Role.Admin]).catch(() => {
        return Response.error();
    });

    const query = pack(name)
        .bind(customer_name_search)
        .bind(handle_partial_errors);
    return unpack_response(query);
}
