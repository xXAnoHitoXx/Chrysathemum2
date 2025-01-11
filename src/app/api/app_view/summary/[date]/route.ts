import { require_permission, Role } from "~/app/api/c_user";
import { unpack_response } from "~/app/api/server_parser";
import { handle_partial_errors } from "~/server/data_error";
import { get_all_technicians } from "~/server/queries/business/technician/technician_queries";
import { get_bisquit } from "~/server/queries/crud/biscuits";
import { retrieve_earnings_information_of_date } from "~/server/queries/earnings/mod";
import { TechAccount } from "~/server/queries/earnings/types";
import { pack, pack_nested } from "~/server/queries/server_queries_monad";
import { Bisquit } from "~/server/validation/bisquit";

export async function GET(
    _: Request,
    { params }: { params: Promise<{ date: string }> },
) {
    await require_permission([Role.Operator, Role.Admin]).catch(() => {
        return Response.error();
    });

    const { date } = await params;

    const query = pack(Bisquit.salon_selection)
        .bind(get_bisquit)
        .bind((salon) => ({ salon: salon, date: date }))
        .bind(retrieve_earnings_information_of_date)
        .bind((accounts, f_db) => {
            return pack_nested(undefined as void, f_db)
                .bind(get_all_technicians)
                .bind(handle_partial_errors)
                .bind((technicians) => {
                    const data: TechAccount[] = [];

                    for (const account of accounts) {
                        for (const tech of technicians) {
                            if (account.id == tech.id) {
                                data.push({
                                    tech: tech,
                                    account: account.account,
                                    date: date,
                                });
                            }
                        }
                    }

                    return data;
                })
                .unpack();
        });

    return unpack_response(query);
}
