import { is_data_error, report_partial_errors } from "~/server/data_error";
import { check_user_permission, Role } from "../../c_user";
import { import_customers_from_old_db } from "~/server/migration/customer/components/import";
import { OldCustomerEntry } from "~/server/migration/customer/components/type_def";
import { FireDB } from "~/server/fire_db";
import { z } from "zod";
import { array_query } from "~/server/server_query";
import { migrate_customer_data } from "~/server/migration/customer/customer_migration";

export async function POST(request: Request): Promise<Response> {
    let user = await check_user_permission([Role.Operator, Role.Admin]);

    if (is_data_error(user)) {
        return Response.json({ message: user.message() }, { status: 401 });
    }

    const req = z.array(OldCustomerEntry).safeParse(await request.json());

    if (!req.success) {
        return Response.json({ message: req.error.message }, { status: 400 });
    }

    const query = await array_query(migrate_customer_data).call(
        req.data,
        FireDB.prod(),
    );

    if (is_data_error(query)) {
        query.report();
        query.log();
        return Response.json({ message: query.message() }, { status: 500 });
    }

    return Response.json({}, { status: 200 });
}

export async function GET(): Promise<Response> {
    let user = await check_user_permission([Role.Operator, Role.Admin]);

    if (is_data_error(user)) {
        return Response.json({ message: user.message() }, { status: 401 });
    }

    const query = await import_customers_from_old_db
        .chain<OldCustomerEntry[]>(report_partial_errors)
        .call(undefined, FireDB.prod());

    if (is_data_error(query)) {
        query.report();
        query.log();
        return Response.json({ message: query.message() }, { status: 500 });
    }

    return Response.json(query, { status: 200 });
}
