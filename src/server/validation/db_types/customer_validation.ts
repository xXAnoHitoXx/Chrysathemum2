import {
    Customer,
    CustomerCreationInfo,
    CustomerUpdateData,
} from "~/server/db_schema/type_def";
import { is_number, is_object, is_string } from "../simple_type";
import { data_error, DataError, is_data_error } from "~/server/data_error";

export function to_customer_creation_info(
    t: unknown,
): CustomerCreationInfo | DataError {
    if (!is_object(t)) {
        return data_error("Casting to Customer", "not an object");
    }

    if (!("name" in t && "phone_number" in t)) {
        return data_error("Casting to Customer", "missing field");
    }

    const { name, phone_number } = t;

    if (!(is_string(name) && is_string(phone_number))) {
        return data_error("Casting to Customer", "wrong field type");
    }

    return { name: name, phone_number: phone_number };
}

function to_customer_update_data(t: unknown): CustomerUpdateData | DataError {
    const context = "Casting to CustomerUpdateData";
    if (!is_object(t)) {
        return data_error(context, "not an object");
    }

    if (!("name" in t && "phone_number" in t && "notes" in t)) {
        return data_error(context, "missing field");
    }

    const { name, phone_number, notes } = t;

    if (!(is_string(name) && is_string(phone_number) && is_string(notes))) {
        return data_error(context, "wrong field type");
    }

    return { name: name, phone_number: phone_number, notes: notes };
}

export function to_customer_update_info(
    t: unknown,
): { customer: Customer; update: CustomerUpdateData } | DataError {
    const context = "Casting to customer update info";
    if (!is_object(t)) {
        return data_error(context, "not an object");
    }

    if (!("customer" in t && "update" in t)) {
        return data_error(context, "missing field");
    }

    const customer = to_customer(t.customer);
    if (is_data_error(customer)) return customer.stack(context, "...");

    const update = to_customer_update_data(t.update);
    if (is_data_error(update)) return update.stack(context, "...");

    return { customer: customer, update: update };
}

export function to_customer(t: unknown): Customer | DataError {
    if (!is_object(t)) {
        return data_error("Casting to Customer", "not an object");
    }

    if (!("id" in t && "name" in t && "phone_number" in t && "notes" in t)) {
        return data_error("Casting to Customer", "missing field");
    }

    const { id, name, notes } = t;

    let { phone_number } = t;

    if (is_number(phone_number)) {
        phone_number = phone_number.toString();
    }

    if (!is_string(phone_number)) {
        return data_error(
            "Casting to Customer",
            "phone number needs to be number or string",
        );
    }

    if (!(is_string(id) && is_string(name) && is_string(notes))) {
        return data_error("Casting to Customer", "wrong field type");
    }

    return { id: id, name: name, phone_number: phone_number, notes: notes };
}
