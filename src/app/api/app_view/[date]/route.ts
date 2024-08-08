import { pack } from "~/server/queries/server_queries_monad";
import { valiDate } from "~/server/validation/semantic/date";
import { retrieve_appointments_on_date } from "~/server/queries/business/appointment/appointment_queries";
import { report_error } from "~/server/data_error";
import { unpack_response } from "../../server_parser";

export async function GET(
    _: Request,
    { params }: { params: { date: string } },
): Promise<Response> {
    const query = pack(params.date)
        .bind(valiDate)
        .bind((date) => ({ date: date }))
        .bind(retrieve_appointments_on_date)
        .bind(report_error);
    return unpack_response(query);
}
