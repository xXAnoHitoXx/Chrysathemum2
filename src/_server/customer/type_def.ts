import { DataError, is_data_error } from "../generic_query/data_error";
import { is_number, is_object, is_string } from "../validation/simple_types";

export type CustomerCreationInfo = {
    name: string;
    phone_number: string;
};

export type CustomerUpdateInfo = {
    customer: Customer;
    update: CustomerUpdateData;
};

export type CustomerUpdateData = {
    name: string;
    phone_number: string;
    notes: string;
};

export type Customer = {
    id: string;
    name: string;
    phone_number: string;
    notes: string;
};

export function to_customer_update_info(
    t: unknown,
): CustomerUpdateInfo | DataError {
    if (!is_object(t)) {
        return new DataError("Casting to CustomerCreationInfo - not an object");
    }

    if (!("customer" in t && "update" in t)) {
        return new DataError("Casting to CustomerCreationInfo - missing field");
    }

    const { customer, update } = t;

    const casted_customer = to_customer(customer);
    const casted_update = to_customer_update_data(update);

    if (is_data_error(casted_customer))
        return casted_customer.stack("casting to CustomerUpdateInfo");
    if (is_data_error(casted_update))
        return casted_update.stack("casting to CustomerUpdateInfo");

    return { customer: casted_customer, update: casted_update };
}

function to_customer_update_data(t: unknown): CustomerUpdateData | DataError {
    if (!is_object(t)) {
        return new DataError("Casting to CustomerCreationInfo - not an object");
    }

    if (!("notes" in t && "name" in t && "phone_number" in t)) {
        return new DataError("Casting to CustomerCreationInfo - missing field");
    }

    const { notes, name, phone_number } = t;

    if (!(is_string(phone_number) && is_string(name) && is_string(notes))) {
        return new DataError("Casting to Customer - wrong field type");
    }

    return { name: name, phone_number: phone_number, notes: notes };
}

export function to_customer_creation_info(
    t: unknown,
): CustomerCreationInfo | DataError {
    if (!is_object(t)) {
        return new DataError("Casting to CustomerCreationInfo - not an object");
    }

    if (!("name" in t && "phone_number" in t)) {
        return new DataError("Casting to CustomerCreationInfo - missing field");
    }

    const { name, phone_number } = t;

    if (!(is_string(phone_number) && is_string(name))) {
        return new DataError("Casting to Customer - wrong field type");
    }

    return { name: name, phone_number: phone_number };
}

export function to_customer(t: unknown): Customer | DataError {
    if (!is_object(t)) {
        return new DataError("Casting to Customer - not an object");
    }

    if (!("id" in t && "name" in t && "phone_number" in t && "notes" in t)) {
        return new DataError("Casting to Customer - missing field");
    }

    const { id, name, notes } = t;

    let { phone_number } = t;

    if (is_number(phone_number)) {
        phone_number = phone_number.toString();
    }

    if (!is_string(phone_number)) {
        return new DataError(
            "Casting to Customer - phone number needs to be number or string",
        );
    }

    if (!(is_string(id) && is_string(name) && is_string(notes))) {
        return new DataError("Casting to Customer - wrong field type");
    }

    return { id: id, name: name, phone_number: phone_number, notes: notes };
}
