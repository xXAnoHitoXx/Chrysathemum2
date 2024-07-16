import { data_error, DataError } from "~/server/data_error";
import { is_object, is_string } from "~/server/validation/simple_type";

export type TechnicianCreationInfo = {
    name: string,
    color: string,
    active_salon: string,
}

export function to_technician_creation_info(t: unknown): TechnicianCreationInfo | DataError {
    const context = "casting to technician creation info";
    if (!is_object(t)) {
        return data_error(context, "not an object");
    }
    
    if (!("name" in t && "color" in t && "active_salon" in t)) {
        return data_error(context, "missing fields");
    }
    
    const { name, color, active_salon } = t;

    if (!(is_string(name) && is_string(color) && is_string(active_salon))) {
        return data_error(context, "wrong field type");
    }

    return { name: name, color: color, active_salon: active_salon }
}

