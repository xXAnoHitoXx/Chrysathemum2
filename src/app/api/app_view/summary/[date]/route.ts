import { check_user_permission, Role } from "~/app/api/c_user";
import {
    DataError,
    is_data_error,
    report_partial_errors,
} from "~/server/data_error";
import { z } from "zod";
import { get_bisquit } from "~/server/bisquit/bisquit";
import { retrieve_earnings_information_of_date } from "~/server/earnings/components/salon";
import { ServerQuery } from "~/server/server_query";
import { FireDB } from "~/server/fire_db";
import { Technician } from "~/server/technician/type_def";
import { retrieve_all_technician_entries } from "~/server/technician/components/technician_entry";
import { EarningEntry, TechnicianEarnings } from "~/server/earnings/type_def";
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

    const f_db = FireDB.active();

    const technicians_query = retrieve_all_technician_entries
        .chain<Technician[]>(report_partial_errors)
        .chain<Record<string, Technician>>((technicians) => {
            const rec: Record<string, Technician> = {};
            for (const technician of technicians) {
                rec[technician.id] = technician;
            }
            return rec;
        })
        .call(undefined as void, f_db);

    const query = await retrieve_earnings_information_of_date
        .chain<(TechnicianEarnings | DataError)[]>(
            ServerQuery.create_query(async (accounts: EarningEntry[]) => {
                const technicians: Record<string, Technician> | DataError =
                    await technicians_query;

                if (is_data_error(technicians)) {
                    return technicians.stack(
                        `retriving earnings information of date ${date}`,
                    );
                }

                const data: (TechnicianEarnings | DataError)[] = [];

                for (const account of accounts) {
                    const technician = technicians[account.id];
                    if (technician === undefined) {
                        data.push(
                            new DataError(`technician not found ${account.id}`),
                        );
                    } else {
                        data.push({
                            date: date,
                            tech: technician,
                            account: account.account,
                            closing: account.closing,
                        });
                    }
                }

                return data;
            }),
        )
        .call({ salon: salon, date: date }, f_db);

    if (is_data_error(query)) {
        query.log();
        query.report();
        return Response.json({ message: query.message() }, { status: 500 });
    }

    return Response.json(query, { status: 200 });
}
