import { pack } from "~/server/queries/server_queries_monad";
import { require_permission, Role } from "../../c_user";
import { Bisquit } from "~/server/validation/bisquit";
import { get_bisquit } from "~/server/queries/crud/biscuits";
import { retrieve_transactions_on_date } from "~/server/queries/business/transaction/transaction_queries";
import {
    data_error,
    handle_partial_errors,
    is_data_error,
} from "~/server/data_error";
import { unpack_response } from "../../server_parser";
import { is_string } from "~/server/validation/simple_type";

export async function GET(
    _: Request,
    { params }: { params: Promise<{ date: string }> },
) {
    const { date } = await params;

    const user = await require_permission([Role.Tech]).catch(() => {
        return data_error("permission", "denied");
    });

    if (is_data_error(user)) {
        return Response.error();
    }

    const query = pack(user)
        .bind((user) => user.publicMetadata.Tech_id)
        .bind((tech_id) => {
            if (is_string(tech_id)) {
                return tech_id;
            }
            return data_error("technician data retrive", "user metadata error");
        })
        .bind((tech_id: string) => {
            return pack(Bisquit.salon_selection)
                .bind(get_bisquit)
                .bind((salon) => ({ salon: salon, date: date }))
                .bind(retrieve_transactions_on_date)
                .bind(handle_partial_errors)
                .bind((transactions) => {
                    return transactions.filter(
                        (transaction) => transaction.technician.id === tech_id,
                    );
                })
                .unpack();
        });

    return unpack_response(query);
}
