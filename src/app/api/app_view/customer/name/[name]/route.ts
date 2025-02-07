import { check_user_permission, Role } from "~/app/api/c_user";
import { CustomerQuery } from "~/server/customer/customer_queries";
import { is_data_error } from "~/server/data_error";
import { FireDB } from "~/server/fire_db";

export async function GET(
    _: Request,
    { params }: { params: Promise<{ name: string }> },
): Promise<Response> {
    let user = await check_user_permission([Role.Operator, Role.Admin]);

    if (is_data_error(user)) {
        return Response.json({ message: user.message() }, { status: 401 });
    }

    const { name } = await params;

    const query = CustomerQuery.name_search.call({ name_search: name }, FireDB.active());

    if (is_data_error(query)) {
        query.report();
        query.log();
        return Response.json({ message: query.message() }, { status: 500 });
    }

    return Response.json(query, { status: 200 });
}
