import { Customer } from "~/server/db_schema/type_def";
import { is_object, is_string } from "../simple_type";
import { data_error, DataError } from "~/server/data_error";

export function to_customer(t: unknown): Customer | DataError {
    if (!is_object(t)) {
        return data_error( "Casting to Customer", "not an object", );
    }
    
    if (!("id" in t && "name" in t && "phone_number" in t && "notes" in t)) {
        return data_error( "Casting to Customer", "missing field", );
    }
    
    const { id, name, phone_number, notes } = t;

    if (!(is_string(id) && is_string(name) && is_string(phone_number) && is_string(notes))) {
        return data_error( "Casting to Customer", "wrong field type", );
    }

    return { id: id, name: name, phone_number: phone_number, notes: notes}
}
