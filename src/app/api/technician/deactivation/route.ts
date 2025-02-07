import { TechnicianQuery } from "~/server/technician/technician_queries";
import { check_user_permission, Role } from "../../c_user";
import { is_data_error } from "~/server/data_error";
import { Technician } from "~/server/technician/type_def";
import { FireDB } from "~/server/fire_db";

export async function PATCH(request: Request): Promise<Response> {
    const user = await check_user_permission([Role.Operator, Role.Admin]);

    if (is_data_error(user)) {
        return Response.json({ message: user.message() }, { status: 401 });
    }

    const technician = Technician.safeParse(await request.json());
    if (!technician.success) {
        return Response.json(
            { message: technician.error.message },
            { status: 400 },
        );
    }

    const query = TechnicianQuery.mark_inactive.call(
        technician.data,
        FireDB.active(),
    );

    if (is_data_error(query)) {
        query.log();
        query.report();
        return Response.json({ message: query.message() }, { status: 500 });
    }

    return Response.json({}, { status: 200 });
}
