import { Location } from "~/server/db_schema/type_def";
import { is_object, is_string } from "../simple_type";
import { data_error, DataError } from "~/server/data_error";

export function to_location(t: unknown): Location | DataError {
    if (!is_object(t)) {
        return data_error( "Casting to Location", "not an object", );
    }
    
    if (!("id" in t && "address" in t)) {
        return data_error( "Casting to Location", "missing field", );
    }
    
    const { id, address } = t;

    if (!(is_string(id) && is_string(address))) {
        return data_error( "Casting to Location", "wrong field type", );
    }

    return { id: id, address: address }
}
