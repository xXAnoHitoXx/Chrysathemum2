import { pack } from "~/server/queries/server_queries_monad";
import { valiDate } from "~/server/validation/semantic/date";
import { retrieve_appointments_on_date } from "~/server/queries/business/appointment/appointment_queries";
import { is_data_error, report_error } from "~/server/data_error";
import { unpack_response } from "~/app/api/server_parser";
import { get_bisquit } from "~/server/queries/crud/biscuits";
import { Bisquit } from "~/server/validation/bisquit";

export async function GET(
    _: Request,
    { params }: { params: { date: string } },
): Promise<Response> {
    const query = pack(params.date)
        .bind(valiDate)
        .bind((date) => {
            const salon = get_bisquit(Bisquit.salon_selection);
            if (is_data_error(salon))
                return salon.stack(
                    "Load Appointments API Call",
                    "no salon_selection bisquit",
                );

            return {
                date: date,
                salon: salon,
            };
        })
        .bind(retrieve_appointments_on_date)
        .bind(report_error);
    return unpack_response(query);
}
