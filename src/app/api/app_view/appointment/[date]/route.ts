import { array_query, pack } from "~/server/queries/server_queries_monad";
import { valiDate } from "~/server/validation/semantic/date";
import {
    create_new_appointment,
    delete_appointment,
    retrieve_appointments_on_date,
    update_appointment,
} from "~/server/queries/business/appointment/appointment_queries";
import { handle_partial_errors, is_data_error } from "~/server/data_error";
import { parse_request, unpack_response } from "~/app/api/server_parser";
import { get_bisquit } from "~/server/queries/crud/biscuits";
import { Bisquit } from "~/server/validation/bisquit";
import { to_array } from "~/server/validation/simple_type";
import {
    to_appointment,
    to_appointment_creation_info,
} from "~/server/validation/db_types/appointment_validation";
import { to_closing_info } from "~/server/validation/db_types/accounting_validation";
import { close_transaction } from "~/server/queries/business/transaction/transaction_queries";

export async function GET(
    _: Request,
    { params }: { params: { date: string } },
): Promise<Response> {
    const query = pack(params.date)
        .bind(valiDate)
        .bind((date) => {
            const salon = get_bisquit(Bisquit.salon_selection);
            if (is_data_error(salon)) {
                return salon.stack(
                    "Load Appointments API Call",
                    "no salon_selection bisquit",
                );
            }

            return {
                date: date,
                salon: salon,
            };
        })
        .bind(retrieve_appointments_on_date)
        .bind((data) => {
            return data;
        })
        .bind(handle_partial_errors);
    return unpack_response(query);
}

export async function POST(
    request: Request,
    { params }: { params: { date: string } },
) {
    const context = "Create Appointmenpts API Call";
    const query = pack(Bisquit.salon_selection)
        .bind(get_bisquit)
        .bind((salon) => {
            return pack(request)
                .bind(parse_request(to_array(to_appointment_creation_info)))
                .bind(
                    array_query(
                        (app) => ({
                            ...app,
                            date: params.date,
                            salon: salon,
                        }),
                        context,
                        "adding salon and date to appointment",
                    ),
                )
                .bind(handle_partial_errors)
                .bind(
                    array_query(
                        create_new_appointment,
                        context,
                        "create appointments",
                    ),
                )
                .bind((partial) => {
                    if (partial.error == null)
                        return { date: params.date, salon: salon };
                    else return partial.error;
                })
                .bind(retrieve_appointments_on_date)
                .bind(handle_partial_errors)
                .unpack();
        });
    return unpack_response(query);
}

export async function PUT(
    request: Request,
    { params }: { params: { date: string } },
) {
    const query = pack(request)
        .bind(parse_request(to_closing_info))
        .bind(close_transaction)
        .bind(() => Bisquit.salon_selection)
        .bind(get_bisquit)
        .bind((salon) => ({ date: params.date, salon: salon }))
        .bind(retrieve_appointments_on_date)
        .bind(handle_partial_errors);

    return unpack_response(query);
}

export async function PATCH(
    request: Request,
    { params }: { params: { date: string } },
) {
    const context = "UPDATE appointments api call";
    const query = pack(Bisquit.salon_selection)
        .bind(get_bisquit)
        .bind((salon) => {
            return pack(request)
                .bind(parse_request(to_array(to_appointment)))
                .bind(
                    array_query(
                        update_appointment,
                        context,
                        "failed to update some appointment",
                    ),
                )
                .bind((partial) => {
                    if (partial.error == null)
                        return { date: params.date, salon: salon };
                    else return partial.error;
                })
                .bind(retrieve_appointments_on_date)
                .bind(handle_partial_errors)
                .unpack();
        });
    return unpack_response(query);
}

export async function DELETE(
    request: Request,
    { params }: { params: { date: string } },
) {
    const query = pack(request)
        .bind(parse_request(to_array(to_appointment)))
        .bind(
            array_query(
                delete_appointment,
                "DELETE appointments api call",
                "...",
            ),
        )
        .bind(handle_partial_errors)
        .bind(() => Bisquit.salon_selection)
        .bind(get_bisquit)
        .bind((salon) => ({ date: params.date, salon: salon }))
        .bind(retrieve_appointments_on_date)
        .bind(handle_partial_errors);
    return unpack_response(query);
}
