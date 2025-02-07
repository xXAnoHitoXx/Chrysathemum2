import { Method } from "~/app/api/api_query";
import { DataError } from "~/server/data_error";
import { z } from "zod";
import { Customer } from "~/server/customer/type_def";

export async function name_search(customer_name: string): Promise<Customer[] | DataError> {
    const response = await fetch(
        "/api/app_view/customer/name/" + customer_name,
        { method: Method.GET },
    );

    const customers = z.array(Customer).safeParse(await response.json())

    if (customers.success) {
        return customers.data;
    }

    return new DataError("name search - error");
}

export async function phone_search(phone_number: string): Promise<Customer[] | DataError> {
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

        const customers = z.array(Customer).safeParse(await response.json())
        if (customers.success) {
            return customers.data;
        }

        return new DataError("phone search - failed to retrieve customers");
    } else {
        return new DataError("phone search - incorrect phone number");
    }
}

export async function create_customer({
    customer_name,
    phone_number,
}: {
    phone_number: string;
    customer_name: string;
}): Promise<Customer | DataError> {
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

        const customer = Customer.safeParse(await response.json())

        if (customer.success) {
            return customer.data;
        }

        return new DataError("create customer - failed to create_customer");
    }

    return new DataError("bad formatting")
}
