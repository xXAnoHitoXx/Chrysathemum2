import { is_data_error } from "~/server/data_error";
import { check_user_permission, Role } from "../../../c_user";
import { z } from "zod";
import { get_bisquit } from "~/server/bisquit/bisquit";
import { TransactionQuery } from "~/server/transaction/transaction_queries";
import { FireDB } from "~/server/fire_db";
import { Transaction } from "~/server/transaction/type_def";
import { Bisquit } from "~/server/bisquit/type_def";

export async function GET(
    _: Request,
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

    const query = await TransactionQuery.retrieve_transactions_on_date.call(
        {
            salon: salon,
            date: date,
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

export async function PATCH(request: Request) {
    let user = await check_user_permission([Role.Operator, Role.Admin]);

    if (is_data_error(user)) {
        return Response.json({ message: user.message() }, { status: 401 });
    }

    const req = Transaction.safeParse(await request.json());

    if (!req.success) {
        return Response.json({ message: req.error.message }, { status: 400 });
    }

    const query = await TransactionQuery.update_transaction.call(
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
