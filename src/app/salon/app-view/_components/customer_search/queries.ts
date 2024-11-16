import { Method } from "~/app/api/api_query";
import { parse_response } from "~/app/api/response_parser";
import { data_error, is_data_error } from "~/server/data_error";
import { Customer } from "~/server/db_schema/type_def";
import { to_customer } from "~/server/validation/db_types/customer_validation";
import { to_array } from "~/server/validation/simple_type";

export async function name_search(customer_name: string): Promise<Customer[]> {
    const response = await fetch(
        "/api/app_view/customer/name/" + customer_name,
        { method: Method.GET },
    );

    const customers = await parse_response(response, to_array(to_customer));

    if (is_data_error(customers)) {
        customers.report();
        return Promise.reject(
            data_error("name_search", "failed to retrieve customer"),
        );
    }

    return customers;
}

export async function phone_search(phone_number: string): Promise<Customer[]> {
    phone_number = phone_number.replaceAll("-", "");
    phone_number = phone_number.replaceAll("(", "");
    phone_number = phone_number.replaceAll(")", "");

    if ([7, 10, 11].includes(phone_number.length)) {
        let full_phone_number = phone_number;

        if (phone_number.length === 7)
            full_phone_number = "1902" + phone_number;
        else if (phone_number.length === 10)
            full_phone_number = "1" + phone_number;

        const response = await fetch(
            "/api/app_view/customer/phone/" + full_phone_number,
            { method: Method.GET },
        );

        const customers = await parse_response(response, to_array(to_customer));

        if (is_data_error(customers)) {
            customers.report();
            return Promise.reject(
                data_error("phone_search", "failed to retrieve customer"),
            );
        }

        return customers;
    } else {
        return Promise.reject(
            data_error("phone_search", "incorrect phone number"),
        );
    }
}

export async function create_customer({
    customer_name,
    phone_number,
}: {
    phone_number: string;
    customer_name: string;
}): Promise<Customer> {
    phone_number = phone_number.replaceAll("-", "");
    phone_number = phone_number.replaceAll("(", "");
    phone_number = phone_number.replaceAll(")", "");

    if ([7, 10, 11].includes(phone_number.length)) {
        let full_phone_number = phone_number;

        if (phone_number.length === 7)
            full_phone_number = "1902" + phone_number;
        else if (phone_number.length === 10)
            full_phone_number = "1" + phone_number;

        const response = await fetch("/api/app_view/customer", {
            method: Method.POST,
            body: JSON.stringify({
                name: customer_name,
                phone_number: full_phone_number,
            }),
        });

        const customer = await parse_response(response, to_customer);

        if (is_data_error(customer)) {
            customer.report();
            return Promise.reject(
                data_error("phone_search", "failed to retrieve customer"),
            );
        }

        return customer;
    }

    return Promise.reject(data_error("create customer", "bad formatting"));
}
