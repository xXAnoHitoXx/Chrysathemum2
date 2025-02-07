import { z } from "zod";
import { check_user_permission, Role } from "~/app/api/c_user";
import { Bisquit, get_bisquit } from "~/server/bisquit/bisquit";
import { is_data_error } from "~/server/data_error";
import { retrieve_tech_earnings_information_of_date } from "~/server/earnings/components/tech";
import { EarningEntry, TechnicianEarnings } from "~/server/earnings/type_def";
import { FireDB } from "~/server/fire_db";
import { ServerQuery } from "~/server/server_query";
import { retrieve_technician_entry } from "~/server/technician/components/technician_entry";
import { Technician } from "~/server/technician/type_def";

export async function GET(
    _: Request,
    { params }: { params: Promise<{ date: string }> },
) {
    let user = await check_user_permission([Role.Tech]);

    if (is_data_error(user)) {
        return Response.json({ message: user.message() }, { status: 401 });
    }

    const tech_id = z.string().safeParse(user.publicMetadata.Tech_id);

    if (!tech_id.success) {
        return Response.json({ message: "Metadata error" }, { status: 401 });
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

    const query = await retrieve_technician_entry
        .chain<TechnicianEarnings>(
            ServerQuery.from_builder((tech) =>
                ServerQuery.create_query((_: Technician) => {
                    return {
                        salon: salon,
                        date: date,
                        id: tech.id,
                    };
                })
                    .chain<EarningEntry>(
                        retrieve_tech_earnings_information_of_date,
                    )
                    .chain<TechnicianEarnings>((account) => {
                        return {
                            date: date,
                            tech: tech,
                            account: account.account,
                            closing: account.closing,
                        };
                    }),
            ),
        )
        .call({ tech_id: tech_id.data }, FireDB.active());

    if (is_data_error(query)) {
        query.log();
        query.report();
        return Response.json({ message: query.message() }, { status: 500 });
    }

    return Response.json(query, { status: 200 });
}
