import { is_data_error } from "~/server/data_error";
import { check_user_permission, Role } from "~/app/api/c_user";
import { get_bisquit } from "~/server/bisquit/bisquit";
import { z } from "zod";
import { AppointmentQuery } from "~/server/appointment/appointment_queries";
import { FireDB } from "~/server/fire_db";
import {
    Appointment,
    AppointmentCreationInfo,
    AppointmentRecordID,
} from "~/server/appointment/type_def";
import { array_query, ServerQuery } from "~/server/server_query";
import { AppointmentClosingData } from "~/server/transaction/type_def";
import { TransactionQuery } from "~/server/transaction/transaction_queries";
import { Bisquit } from "~/server/bisquit/type_def";

export async function GET(
    _: Request,
    { params }: { params: Promise<{ date: string }> },
): Promise<Response> {
    let user = await check_user_permission([Role.Operator, Role.Admin]);

    if (is_data_error(user)) {
        return Response.json({ message: user.message() }, { status: 401 });
    }

    const params_data = await params;

    const validated_date = z.string().date().safeParse(params_data.date);
    if (!validated_date.success) {
        return Response.json({ message: "bad params" }, { status: 400 });
    }

    const date: string = validated_date.data;

    const salon = await get_bisquit(Bisquit.enum.salon_selection);

    if (is_data_error(salon)) {
        return Response.json({ message: salon.message() }, { status: 400 });
    }

    const query = await AppointmentQuery.retrieve_appointments_on_date.call(
        {
            date: date,
            salon: salon,
        },
        FireDB.active(),
    );

    if (is_data_error(query)) {
        query.report();
        query.log();
        return Response.json({ message: query.message() }, { status: 500 });
    }

    return Response.json(query, { status: 200 });
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ date: string }> },
) {
    let user = await check_user_permission([Role.Operator, Role.Admin]);

    if (is_data_error(user)) {
        return Response.json({ message: user.message() }, { status: 401 });
    }

    const params_data = await params;

    const validated_date = z.string().date().safeParse(params_data.date);
    if (!validated_date.success) {
        return Response.json({ message: "bad params" }, { status: 400 });
    }

    const date: string = validated_date.data;

    const salon = await get_bisquit(Bisquit.enum.salon_selection);

    if (is_data_error(salon)) {
        return Response.json({ message: salon.message() }, { status: 400 });
    }

    const req = z
        .array(AppointmentCreationInfo)
        .safeParse(await request.json());

    if (!req.success) {
        return Response.json({ message: req.error.message }, { status: 400 });
    }

    const query = await array_query(
        ServerQuery.create_query((info: AppointmentCreationInfo) => {
            return {
                ...info,
                date: date,
                salon: salon,
            };
        }).chain<Appointment>(AppointmentQuery.create_new_appointment),
    ).call(req.data, FireDB.active());

    if (is_data_error(query)) {
        query.report();
        query.log();
        return Response.json({ message: query.message() }, { status: 500 });
    }

    return Response.json(query, { status: 200 });
}

export async function PUT(
    request: Request,
    _: { params: Promise<{ date: string }> },
) {
    let user = await check_user_permission([Role.Operator, Role.Admin]);

    if (is_data_error(user)) {
        return Response.json({ message: user.message() }, { status: 401 });
    }

    const req = AppointmentClosingData.safeParse(await request.json());

    if (!req.success) {
        return Response.json({ message: req.error.message }, { status: 400 });
    }

    const query = await TransactionQuery.close_transaction.call(
        req.data,
        FireDB.active(),
    );

    if (is_data_error(query)) {
        query.report();
        query.log();
        return Response.json({ message: query.message() }, { status: 500 });
    }

    return Response.json({}, { status: 200 });
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ date: string }> },
) {
    let user = await check_user_permission([Role.Operator, Role.Admin]);

    if (is_data_error(user)) {
        return Response.json({ message: user.message() }, { status: 401 });
    }

    const params_data = await params;

    const validated_date = z.string().date().safeParse(params_data.date);
    if (!validated_date.success) {
        return Response.json({ message: "bad params" }, { status: 400 });
    }

    const date: string = validated_date.data;

    const salon = await get_bisquit(Bisquit.enum.salon_selection);

    if (is_data_error(salon)) {
        return Response.json({ message: salon.message() }, { status: 400 });
    }

    const req = z.array(Appointment).safeParse(await request.json());

    if (!req.success) {
        return Response.json({ message: req.error.message }, { status: 400 });
    }

    const query = await array_query(AppointmentQuery.update_appointment)
        .chain<AppointmentRecordID>(() => {
            return {
                salon: salon,
                date: date,
            };
        })
        .chain(AppointmentQuery.retrieve_appointments_on_date)
        .call(req.data, FireDB.active());

    if (is_data_error(query)) {
        query.report();
        query.log();
        return Response.json({ message: query.message() }, { status: 500 });
    }

    return Response.json(query, { status: 200 });
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ date: string }> },
) {
    let user = await check_user_permission([Role.Operator, Role.Admin]);

    if (is_data_error(user)) {
        return Response.json({ message: user.message() }, { status: 401 });
    }

    const params_data = await params;

    const validated_date = z.string().date().safeParse(params_data.date);
    if (!validated_date.success) {
        return Response.json({ message: "bad params" }, { status: 400 });
    }

    const date: string = validated_date.data;

    const salon = await get_bisquit(Bisquit.enum.salon_selection);

    if (is_data_error(salon)) {
        return Response.json({ message: salon.message() }, { status: 400 });
    }

    const req = z.array(Appointment).safeParse(await request.json());

    if (!req.success) {
        return Response.json({ message: req.error.message }, { status: 400 });
    }

    const query = await array_query(AppointmentQuery.delete_appointment)
        .chain<AppointmentRecordID>(() => {
            return {
                salon: salon,
                date: date,
            };
        })
        .chain(AppointmentQuery.retrieve_appointments_on_date)
        .call(req.data, FireDB.active());

    if (is_data_error(query)) {
        query.report();
        query.log();
        return Response.json({ message: query.message() }, { status: 500 });
    }

    return Response.json(query, { status: 200 });
}
