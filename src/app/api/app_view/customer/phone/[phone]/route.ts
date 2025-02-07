import { check_user_permission, Role } from "~/app/api/c_user";
import { CustomerQuery } from "~/server/customer/customer_queries";
import { is_data_error } from "~/server/data_error";
import { FireDB } from "~/server/fire_db";

export async function GET(
    _: Request,
    { params }: { params: Promise<{ phone: string }> },
): Promise<Response> {
    let user = await check_user_permission([Role.Operator, Role.Admin]);

    if (is_data_error(user)) {
        return Response.json({ message: user.message() }, { status: 401 });
    }

    const { phone } = await params;

    const query = await CustomerQuery.phone_search.call({ phone_search: phone }, FireDB.active());

    if (is_data_error(query)) {
        query.report();
        query.log();
        return Response.json({ message: query.message() }, { status: 500 });
    }

    return Response.json(query, { status: 200 });
}
