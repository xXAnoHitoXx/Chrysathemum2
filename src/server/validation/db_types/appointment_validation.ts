import { data_error, DataError } from "~/server/data_error";
import { is_number, is_object, is_string } from "../simple_type";
import { Appointment } from "~/server/db_schema/type_def";

export function to_appointment(t: unknown): Appointment | DataError {
    if (!is_object(t)) {
        return data_error( "Casting to Appointment", "not an object", );
    }
    
    if (!("id" in t && "customer_id" in t && "date" in t 
        && "time" in t && "duration" in t && "details" in t)) {
        return data_error( "Casting to Appointment", "missing field", );
    }
    
    const { id, customer_id, date, time, duration, details } = t;

    if (!(is_string(id) && is_string(customer_id) && is_string(date) 
        && is_number(time) && is_number(duration) && is_string(details))) {
        return data_error( "Casting to Appointment", "wrong field type" );
    }

    if (time < 1 || time > 52) {
        return data_error( "Casting to Appointment", "appointment time out of range" );
    }

    if(!("technician_id" in t)) {
        return { id: id, customer_id: customer_id, technician_id: null, date: date,
            time: time, duration: duration, details: details }
    }

    const { technician_id } = t;

    if(!is_string(technician_id)) {
        return data_error( "Casting to Appointment", "technician_id is not string" );
    }

    return { id: id, customer_id: customer_id, technician_id: technician_id, date: date,
        time: time, duration: duration, details: details }
}
