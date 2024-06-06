import { Customer } from "~/server/db_schema/type_def";
import { TypeConversionError } from "../validation_error";
import { server_error } from "~/server/server_error";
import { is_object } from "../simple_type";

export function to_customer(t: unknown): Customer | TypeConversionError {
    if (!is_object(t)) {
        return server_error("unknown is not Customer");
    }
    
    if (!("id" in t && "name" in t && "phone_number" in t && "notes" in t)) {
        return server_error("unknown is not Customer");
    }
    
    const { id, name, phone_number, notes } = t;

    if (typeof id !== "string" || id == null) {
        return server_error("unknown is not Customer");
    }

    if (typeof name !== "string" || name == null) {
        return server_error("unknown is not Customer");
    }

    if (typeof phone_number !== "string" || phone_number == null) {
        return server_error("unknown is not Customer");
    }

    if (typeof notes !== "string" || notes == null) {
        return server_error("unknown is not Customer");
    }

    return { id: id, name: name, phone_number: phone_number, notes: notes}
}
