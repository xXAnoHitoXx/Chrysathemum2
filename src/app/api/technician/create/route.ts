import { is_data_error } from "~/server/data_error";
import { check_user_permission, Role } from "../../c_user";
import { TechnicianCreationInfo } from "~/server/technician/type_def";
import { TechnicianQuery } from "~/server/technician/technician_queries";
import { FireDB } from "~/server/fire_db";

export async function POST(request: Request): Promise<Response> {
    let user = await check_user_permission([Role.Admin, Role.Operator]);

    if (is_data_error(user)) {
        return Response.json({ message: user.message() }, { status: 401 });
    }

    const data = TechnicianCreationInfo.safeParse(await request.json());

    if (!data.success) {
        return Response.json(
            { message: `bad params - ${data.error.toString()}` },
            { status: 400 },
        );
    }

    const technician_creation_query =
        await TechnicianQuery.create_new_technician.call(
            data.data,
            FireDB.active(),
        );

    if (is_data_error(technician_creation_query)) {
        technician_creation_query.log();
        technician_creation_query.report();
        return Response.json(
            {
                message: `server error - ${technician_creation_query.message()}`,
            },
            { status: 500 },
        );
    }

    return Response.json(technician_creation_query, { status: 200 });
}
