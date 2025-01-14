import { pack } from "~/server/queries/server_queries_monad";
import { Bisquit } from "~/server/validation/bisquit";
import { get_bisquit } from "~/server/queries/crud/biscuits";
import { data_error, is_data_error } from "~/server/data_error";
import { is_string } from "~/server/validation/simple_type";
import { require_permission, Role } from "~/app/api/c_user";
import { unpack_response } from "~/app/api/server_parser";
import { retrieve_technician_entry } from "~/server/queries/crud/technician/technician_entry";
import { retrieve_tech_earnings_information_of_date } from "~/server/queries/tech/earnings/mod";
import { valiDate } from "~/server/validation/semantic/date";

export async function GET(
    _: Request,
    { params }: { params: Promise<{ date: string }> },
) {
    const { date } = await params;

    const validated_date = valiDate(date);

    const user = await require_permission([Role.Tech]).catch(() => {
        return data_error("permission", "denied");
    });

    if (is_data_error(user)) {
        return Response.error();
    }

    if (is_data_error(validated_date)) {
        return Response.error();
    }

    const query = pack(user)
        .bind((user) => user.publicMetadata.Tech_id)
        .bind((tech_id) => {
            if (is_string(tech_id)) {
                return { id: tech_id };
            }
            return data_error("technician data retrive", "user metadata error");
        })
        .bind(retrieve_technician_entry)
        .bind((tech) => {
            return pack(Bisquit.salon_selection)
                .bind(get_bisquit)
                .bind((salon) => ({
                    salon: salon,
                    date: validated_date,
                    tech_id: tech.id,
                }))
                .bind(retrieve_tech_earnings_information_of_date)
                .bind((acc) => {
                    return {
                        tech: tech,
                        account: acc.account,
                        date: validated_date,
                        closing: acc.closing,
                    };
                })
                .unpack();
        });

    return unpack_response(query);
}
