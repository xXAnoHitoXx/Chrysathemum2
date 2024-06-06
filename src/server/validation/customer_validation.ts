import { Customer } from "../db_schema/type_def";
import { server_error } from "../server_error";
import { TypeConversionError } from "./validation_error";

export function to_customer(t: unknown): Customer | TypeConversionError {
    if (typeof t !== "object" || t == null) {
        return server_error("unknow is not Technician");
    }
    
    if (!("id" in t && "name" in t && "phone_number" in t && "notes" in t)) {
        return server_error("unknow is not Technician");
    }
    
    const { id, name, phone_number, notes } = t;

    if (typeof id !== "string" || id == null) {
        return server_error("unknow is not Technician");
    }

    if (typeof name !== "string" || name == null) {
        return server_error("unknow is not Technician");
    }

    if (typeof phone_number !== "string" || phone_number == null) {
        return server_error("unknow is not Technician");
    }

    if (typeof notes !== "string" || notes == null) {
        return server_error("unknow is not Technician");
    }

    return { id: id, name: name, phone_number: phone_number, notes: notes}
}
