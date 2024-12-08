import { retrieve_customers_appointments } from "~/server/queries/business/appointment/appointment_queries";
import { retrieve_customer_history } from "~/server/queries/business/transaction/transaction_queries";
import {
    DataError,
    handle_partial_errors,
    is_data_error,
    lotta_errors,
} from "~/server/data_error";
import { Appointment, Transaction } from "~/server/db_schema/type_def";
import { pack } from "~/server/queries/server_queries_monad";
import { parse_request, unpack_response } from "../../../server_parser";
import { to_customer } from "~/server/validation/db_types/customer_validation";
import { require_permission, Role } from "~/app/api/c_user";

export async function POST(request: Request) {
    await require_permission([Role.Operator, Role.Admin]).catch(() => {
        return Response.error();
    });

    const query = pack(request)
        .bind(parse_request(to_customer))
        .bind(async (customer, f_db) => {
            const appointment_query = retrieve_customers_appointments(
                customer,
                f_db,
            );
            const transaction_query = retrieve_customer_history(customer, f_db);

            const errors: DataError[] = [];
            const customer_data: {
                appointments: Appointment[];
                transactions: Transaction[];
            } = {
                appointments: [],
                transactions: [],
            };

            const appointment_result = await appointment_query;

            if (is_data_error(appointment_result)) {
                errors.push(appointment_result);
            } else {
                if (appointment_result.error != null) {
                    errors.push(appointment_result.error);
                }
                customer_data.appointments = appointment_result.data;
            }

            const transaction_result = await transaction_query;

            if (is_data_error(transaction_result)) {
                errors.push(transaction_result);
            } else {
                if (transaction_result.error != null) {
                    errors.push(transaction_result.error);
                }
                customer_data.transactions = transaction_result.data;
            }

            return {
                data: customer_data,
                error:
                    errors.length === 0
                        ? null
                        : lotta_errors(
                              "retrieving customer data",
                              `{name:${customer.name}, id:${customer.id}}`,
                              errors,
                          ),
            };
        })
        .bind(handle_partial_errors);
    return unpack_response(query);
}
