import { Customer } from "~/server/db_schema/type_def";
import { TypeConversionError } from "../validation_error";
import { is_object, is_string } from "../simple_type";

export function to_customer(t: unknown): Customer | TypeConversionError {
    if (!is_object(t)) {
        return { error: "unknown is not Customer" }
    }
    
    if (!("id" in t && "name" in t && "phone_number" in t && "notes" in t)) {
        return { error: "unknown is not Customer" }
    }
    
    const { id, name, phone_number, notes } = t;

    if (!(is_string(id) && is_string(name) && is_string(phone_number) && is_string(notes))) {
        return { error: "unknown is not Customer" }
    }

    return { id: id, name: name, phone_number: phone_number, notes: notes}
}
