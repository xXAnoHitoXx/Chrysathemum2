import "reflect-metadata"
import { is_boolean, is_object, is_string } from "../simple_type";
import { Technician } from "~/server/db_schema/type_def";
import { TypeConversionError } from "../validation_error";

export function to_technician(t: unknown): Technician | TypeConversionError {
    if (!is_object(t)) {
        return { error: "unknown is not Technician" }
    }
    
    if (!("id" in t && "name" in t && "color" in t && "active" in t)) {
        return { error: "unknown is not Technician" }
    }
    
    const { id, name, color, active } = t;

    if (!(is_string(id) && is_string(name) && is_string(color) && is_boolean(active))) {
        return { error: "unknown is not Technician" }
    }

    return { id: id, name: name, color: color, active: active }
}
