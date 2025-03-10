import { check_user_permission, Role } from "~/app/api/c_user";
import { get_bisquit } from "~/server/bisquit/bisquit";
import { z } from "zod";
import { is_data_error, report_partial_errors } from "~/server/data_error";
import { TransactionQuery } from "~/server/transaction/transaction_queries";
import { Transaction } from "~/server/transaction/type_def"; import { FireDB } from "~/server/fire_db";
import { Bisquit } from "~/server/bisquit/type_def";

export async function GET(
    _: Request,
    { params }: { params: Promise<{ date: string }> },
) {
    let user = await check_user_permission([Role.Tech]);

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

    const tech_id = z.string().safeParse(user.publicMetadata.Tech_id);

    if (!tech_id.success) {
        return Response.json({ message: "Metadata error" }, { status: 401 });
    }

    const query = await TransactionQuery.retrieve_transactions_on_date
        .chain<Transaction[]>(report_partial_errors)
        .chain((transactions: Transaction[]) =>
            transactions.filter(
                (transaction) => transaction.technician.id === tech_id.data,
            ),
        )
        .call({ salon: salon, date: date }, FireDB.active());

    if (is_data_error(query)) {
        query.log();
        query.report();
        return Response.json({ message: query.message() }, { status: 500 });
    }

    return Response.json(query, { status: 200 });
}
