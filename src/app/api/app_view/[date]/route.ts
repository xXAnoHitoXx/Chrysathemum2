import { pack } from "~/server/queries/server_queries_monad";
import { valiDate } from "~/server/validation/semantic/date";
import {
    create_new_appointment,
    retrieve_appointments_on_date,
} from "~/server/queries/business/appointment/appointment_queries";
import {
    data_error,
    DataError,
    handle_partial_errors,
    is_data_error,
    lotta_errors,
} from "~/server/data_error";
import { parse_request, unpack_response } from "~/app/api/server_parser";
import { get_bisquit } from "~/server/queries/crud/biscuits";
import { Bisquit } from "~/server/validation/bisquit";
import { to_array } from "~/server/validation/simple_type";
import { to_appointment_creation_info } from "~/server/validation/db_types/appointment_validation";

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
        .bind(handle_partial_errors);
    return unpack_response(query);
}

export async function POST(
    request: Request,
    { params }: { params: { date: string } },
) {
    const context = "Create Appointments API Call";
    const query = pack(request)
        .bind(parse_request(to_array(to_appointment_creation_info)))
        .bind(async (arr, f_db) => {
            const salon = get_bisquit(Bisquit.salon_selection);
            if (is_data_error(salon)) {
                return salon.stack(context, "no bisquit");
            }

            const errors: DataError[] = [];
            for (let i = 0; i < arr.length; i++) {
                const info = arr[i];
                if (info) {
                    info.date = params.date;
                    info.salon = salon;

                    const res = await create_new_appointment(info, f_db);
                    if (is_data_error(res)) {
                        errors.push(
                            res.stack(context, "failed to create appointment"),
                        );
                    }
                } else {
                    errors.push(data_error(context, "undefined creation info"));
                }
            }

            if (errors.length == 0) {
                const info = arr[0];
                if (info == undefined) {
                    return data_error(context, "empty request");
                }
                return { date: info.date, salon: info.salon };
            } else
                return lotta_errors(
                    context,
                    "encountered at least one error",
                    errors,
                );
        })
        .bind(retrieve_appointments_on_date)
        .bind(handle_partial_errors);
    return unpack_response(query);
}
