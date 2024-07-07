import { Location } from "~/server/db_schema/type_def";
import { TypeConversionError } from "../validation_error";
import { is_object, is_string } from "../simple_type";

export function to_location(t: unknown): Location | TypeConversionError {
    if (!is_object(t)) {
        return { error: "unknown is not Customer" }
    }
    
    if (!("id" in t && "address" in t)) {
        return { error: "unknown is not Customer" }
    }
    
    const { id, address } = t;

    if (!(is_string(id) && is_string(address))) {
        return { error: "unknown is not Customer" }
    }

    return { id: id, address: address }
}
