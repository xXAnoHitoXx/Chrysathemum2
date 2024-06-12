import { server_error } from "~/server/server_error";
import { is_object, is_string } from "~/server/validation/simple_type";
import { TypeConversionError } from "~/server/validation/validation_error";

export type OldCustomerData = {
    id: string,
    name: string,
    phoneNumber: string,
}

export function to_old_customer_data(t: unknown): OldCustomerData | TypeConversionError {
    if (!is_object(t)) {
        return server_error("unknown is not OldCustomerData");
    }
    
    if (!("name" in t && "id" in t && "phoneNumber" in t)) {
        return server_error("unknown is not OldCustomerData");
    }
    
    const { name, id, phoneNumber } = t;

    if (!(is_string(name) && is_string(id) && is_string(phoneNumber))) {
        return server_error("unknown is not OldCustomerData");
    }

    return { name: name, id: id, phoneNumber: phoneNumber }
}

