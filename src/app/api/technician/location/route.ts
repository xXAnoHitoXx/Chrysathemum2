import { is_data_error } from "~/server/data_error";
import { check_user_permission, Role } from "../../c_user";
import { get_bisquit } from "~/server/bisquit/bisquit";
import { TechnicianQuery } from "~/server/technician/technician_queries";
import { FireDB } from "~/server/fire_db";
import { Technician } from "~/server/technician/type_def";
import { Bisquit } from "~/server/bisquit/type_def";

export async function GET() {
    const user = await check_user_permission([Role.Operator, Role.Admin]);

    if (is_data_error(user)) {
        return Response.json({ message: user.message() }, { status: 401 });
    }

    const salon = await get_bisquit(Bisquit.enum.salon_selection);

    if (is_data_error(salon)) {
        return Response.json({ message: salon.message() }, { status: 400 });
    }

    const query = await TechnicianQuery.get_tech_at_location.call(
        { location_id: salon },
        FireDB.active(),
    );

    if (is_data_error(query))
        return Response.json({ message: query.message() }, { status: 500 });

    return Response.json(query, { status: 200 });
}

export async function POST(request: Request): Promise<Response> {
    const user = await check_user_permission([Role.Operator, Role.Admin]);

    if (is_data_error(user)) {
        return Response.json({ message: user.message() }, { status: 401 });
    }

    const salon = await get_bisquit(Bisquit.enum.salon_selection);

    if (is_data_error(salon)) {
        return Response.json({ message: salon.message() }, { status: 400 });
    }

    const technician = Technician.safeParse(await request.json());
    if (!technician.success) {
        return Response.json(
            { message: technician.error.message },
            { status: 400 },
        );
    }

    const query = await TechnicianQuery.assign_tech_to_location.call(
        {
            location_id: salon,
            technician_id: technician.data.id,
        },
        FireDB.active(),
    );

    if (is_data_error(query)) {
        query.log();
        query.report();
        return Response.json({ message: query.message() }, { status: 500 });
    }

    return Response.json({}, { status: 200 });
}

export async function DELETE(request: Request): Promise<Response> {
    const user = await check_user_permission([Role.Operator, Role.Admin]);

    if (is_data_error(user)) {
        return Response.json({ message: user.message() }, { status: 401 });
    }

    const salon = await get_bisquit(Bisquit.enum.salon_selection);

    if (is_data_error(salon)) {
        return Response.json({ message: salon.message() }, { status: 400 });
    }

    const technician = Technician.safeParse(await request.json());
    if (!technician.success) {
        return Response.json(
            { message: technician.error.message },
            { status: 400 },
        );
    }
    const query = await TechnicianQuery.unassign_tech_from_location.call(
        {
            location_id: salon,
            technician_id: technician.data.id,
        },
        FireDB.active(),
    );

    if (is_data_error(query)) {
        query.log();
        query.report();
        return Response.json({ message: query.message() }, { status: 500 });
    }

    return Response.json({}, { status: 200 });
}
