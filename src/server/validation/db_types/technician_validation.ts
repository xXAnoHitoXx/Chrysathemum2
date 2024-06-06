import "reflect-metadata"
import { is_boolean, is_object, is_string } from "../simple_type";
import { server_error } from "~/server/server_error";
import { Technician, TechnicianCreationInfo } from "~/server/db_schema/type_def";
import { TypeConversionError } from "../validation_error";

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

export function to_technician(t: unknown): Technician | TypeConversionError {
    if (!is_object(t)) {
        return server_error("unknown is not Technician");
    }
    
    if (!("id" in t && "name" in t && "color" in t && "active" in t)) {
        return server_error("unknown is not Technician");
    }
    
    const { id, name, color, active } = t;

    if (!(is_string(id) && is_string(name) && is_string(color) && is_boolean(active))) {
        return server_error("unknown is not Technician");
    }

    return { id: id, name: name, color: color, active: active }
}
