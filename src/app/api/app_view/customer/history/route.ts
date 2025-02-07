import { is_data_error } from "~/server/data_error";
import { check_user_permission, Role } from "~/app/api/c_user";
import { AppointmentQuery } from "~/server/appointment/appointment_queries";
import { Customer } from "~/server/customer/type_def";
import { FireDB } from "~/server/fire_db";
import { TransactionQuery } from "~/server/transaction/transaction_queries";
import { CustomerHistoryData } from "./type_def";

export async function POST(request: Request) {
    let user = await check_user_permission([Role.Operator, Role.Admin]);

    if (is_data_error(user)) {
        return Response.json({ message: user.message() }, { status: 401 });
    }

    const req = Customer.safeParse(await request.json());

    if (!req.success) {
        return Response.json({ message: req.error.message }, { status: 400 });
    }

    const appointment_query =
        AppointmentQuery.retrieve_customers_appointments.call(
            req.data,
            FireDB.active(),
        );

    const query = await TransactionQuery.retrieve_customer_history
        .chain<CustomerHistoryData>(async (transactions) => {
            const appointments = await appointment_query;

            if (is_data_error(appointments)) {
                return appointments.stack("retrieving history");
            }

            return {
                appointments: appointments,
                transactions: transactions,
            };
        })
        .call(req.data, FireDB.active());

    if (is_data_error(query)) {
        query.report();
        query.log();
        return Response.json({ message: query.message() }, { status: 500 });
    }

    return Response.json(query, { status: 200 });
}
