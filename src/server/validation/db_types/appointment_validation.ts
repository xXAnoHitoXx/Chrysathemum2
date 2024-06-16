import { TypeConversionError } from "../validation_error";
import { is_object, is_string } from "../simple_type";
import { server_error } from "~/server/server_error";
import { Appointment } from "~/server/db_schema/type_def";

export function to_appointment(t: unknown): Appointment | TypeConversionError {
    if (!is_object(t)) {
        return server_error("unknown is not Appointment");
    }
    
    if (!("id" in t && "customer_id" in t && "date" in t 
        && "time" in t && "duration" in t && "details" in t)) {
        return server_error("unknown is not Appointment");
    }
    
    const { id, customer_id, date, time, duration, details } = t;

    if (!(is_string(id) && is_string(customer_id) && is_string(date) 
        && is_string(time) && is_string(duration) && is_string(details))) {
        return server_error("unknown is not Appointment");
    }

    if(!("technician_id" in t)) {
        return { id: id, customer_id: customer_id, technician_id: null, date: date,
            time: time, duration: duration, details: details }
    }

    const { technician_id } = t;

    if(!is_string(technician_id)) {
        return server_error("unknown is not Appointment");
    }

    return { id: id, customer_id: customer_id, technician_id: technician_id, date: date,
        time: time, duration: duration, details: details }
}
