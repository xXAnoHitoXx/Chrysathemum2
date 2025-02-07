import { check_user_permission, Role } from "~/app/api/c_user";
import { CustomerQuery } from "~/server/customer/customer_queries";
import {
    CustomerCreationInfo,
    CustomerUpdateInfo,
} from "~/server/customer/type_def";
import { is_data_error } from "~/server/data_error";
import { FireDB } from "~/server/fire_db";

export async function POST(request: Request): Promise<Response> {
    let user = await check_user_permission([Role.Operator, Role.Admin]);

    if (is_data_error(user)) {
        return Response.json({ message: user.message() }, { status: 401 });
    }

    const req = CustomerCreationInfo.safeParse(await request.json());

    if (!req.success) {
        return Response.json({ message: req.error.message }, { status: 400 });
    }

    const query = CustomerQuery.create_new_customer.call(
        req.data,
        FireDB.active(),
    );

    if (is_data_error(query)) {
        query.report();
        query.log();
        return Response.json({ message: query.message() }, { status: 500 });
    }

    return Response.json(query, { status: 200 });
}

export async function PATCH(request: Request): Promise<Response> {
    let user = await check_user_permission([Role.Operator, Role.Admin]);

    if (is_data_error(user)) {
        return Response.json({ message: user.message() }, { status: 401 });
    }

    const req = CustomerUpdateInfo.safeParse(await request.json());

    if (!req.success) {
        return Response.json({ message: req.error.message }, { status: 400 });
    }

    const query = CustomerQuery.update_customer_info.call(
        req.data,
        FireDB.active(),
    );

    if (is_data_error(query)) {
        query.report();
        query.log();
        return Response.json({ message: query.message() }, { status: 500 });
    }

    return Response.json(query, { status: 200 });
}
