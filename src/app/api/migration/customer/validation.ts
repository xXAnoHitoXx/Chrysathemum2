/*
import { data_error, DataError } from "~/server/data_error";
import {
    is_number,
    is_object,
    is_string,
} from "~/server/validation/simple_type";

export type OldCustomerData = {
    id: string;
    name: string;
    phoneNumber: string;
};

export function to_old_customer_data(t: unknown): OldCustomerData | DataError {
    const context = "Casting to OldCustomerData";
    if (!is_object(t)) {
        return data_error(context, "not an object");
    }

    if (!("name" in t && "id" in t && "phoneNumber" in t)) {
        return data_error(context, "missing fields");
    }

    const { name, id, phoneNumber } = t;

    if (!is_string(name)) {
        return data_error(context, "wrong field types");
    }

    if (is_number(id) && is_number(phoneNumber)) {
        return {
            name: name,
            id: id.toString(),
            phoneNumber: phoneNumber.toString(),
        };
    }

    if (!(is_string(id) && is_string(phoneNumber))) {
        return data_error(context, "wrong field types");
    }

    return { name: name, id: id, phoneNumber: phoneNumber };
}
*/
