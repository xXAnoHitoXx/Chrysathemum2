import { pack } from "~/server/queries/server_queries_monad";
import { parse_request, unpack_response } from "../server_parser";
import { valiDate } from "~/server/validation/semantic/date";
import { retrieve_appointments_on_date } from "~/server/queries/business/appointment/appointment_queries";
import { report_error } from "~/server/data_error";

export async function GET(request: Request): Promise<Response> {
    const query = pack(request)
        .bind(parse_request(valiDate))
        .bind((date) => ({ date: date }))
        .bind(retrieve_appointments_on_date)
        .bind(report_error);
    return unpack_response(query);
}

export async function POST(request: Request) {}

export async function UPDATE(request: Request) {}
