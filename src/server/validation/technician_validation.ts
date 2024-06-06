import "reflect-metadata"
import { Technician, TechnicianCreationInfo } from "../db_schema/type_def"
import { TypeConversionError } from "./validation_error";
import { server_error } from "../server_error";

export function to_technician_creation_info(t: unknown): TechnicianCreationInfo | TypeConversionError {
    if (typeof t !== "object" || t == null) {
        return server_error("unknow is not Technician");
    }
    
    if (!("name" in t && "color" in t && "active_salon" in t)) {
        return server_error("unknow is not TechnicianCreationInfo");
    }
    
    const { name, color, active_salon } = t;

    if (typeof name !== "string" || name == null) {
        return server_error("unknow is not Technician");
    }

    if (typeof color !== "string" || color == null) {
        return server_error("unknow is not Technician");
    }

    if (typeof active_salon !== "string" || active_salon == null) {
        return server_error("unknow is not Technician");
    }

    return { name: name, color: color, active_salon: active_salon }
}

export function to_technician(t: unknown): Technician | TypeConversionError {
    if (typeof t !== "object" || t == null) {
        return server_error("unknow is not Technician");
    }
    
    if (!("id" in t && "name" in t && "color" in t && "active" in t)) {
        return server_error("unknow is not Technician");
    }
    
    const { id, name, color, active } = t;

    if (typeof id !== "string" || id == null) {
        return server_error("unknow is not Technician");
    }

    if (typeof name !== "string" || name == null) {
        return server_error("unknow is not Technician");
    }

    if (typeof color !== "string" || color == null) {
        return server_error("unknow is not Technician");
    }

    if (typeof active !== "boolean" || active == null) {
        return server_error("unknow is not Technician");
    }

    return { id: id, name: name, color: color, active: active }
}
