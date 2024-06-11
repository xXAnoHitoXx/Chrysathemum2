import { server_error } from "~/server/server_error";
import { is_object, is_string } from "~/server/validation/simple_type";
import { TypeConversionError } from "~/server/validation/validation_error";

export type TechnicianCreationInfo = {
    name: string,
    color: string,
    active_salon: string,
}

export function to_technician_creation_info(t: unknown): TechnicianCreationInfo | TypeConversionError {
    if (!is_object(t)) {
        return server_error("unknown is not Technician");
    }
    
    if (!("name" in t && "color" in t && "active_salon" in t)) {
        return server_error("unknown is not TechnicianCreationInfo");
    }
    
    const { name, color, active_salon } = t;

    if (!(is_string(name) && is_string(color) && is_string(active_salon))) {
        return server_error("unknown is not Technician");
    }

    return { name: name, color: color, active_salon: active_salon }
}

