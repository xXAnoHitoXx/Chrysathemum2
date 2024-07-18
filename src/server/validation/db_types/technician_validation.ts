import "reflect-metadata";
import { is_boolean, is_object, is_string } from "../simple_type";
import { Technician } from "~/server/db_schema/type_def";
import { data_error, DataError } from "~/server/data_error";

export function to_technician(t: unknown): Technician | DataError {
    if (!is_object(t)) {
        return data_error("Casting to Technician", "not an object");
    }

    if (!("id" in t && "name" in t && "color" in t && "active" in t)) {
        return data_error("Casting to Technician", "missing field");
    }

    const { id, name, color, active } = t;

    if (
        !(
            is_string(id) &&
            is_string(name) &&
            is_string(color) &&
            is_boolean(active)
        )
    ) {
        return data_error("Casting to Technician", "wrong field type");
    }

    return { id: id, name: name, color: color, active: active };
}
