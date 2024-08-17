import { data_error, DataError, is_data_error } from "~/server/data_error";
import { is_number, is_object, is_string } from "../simple_type";
import {
    Appointment,
    AppointmentCreationInfo,
    AppointmentEntry,
} from "~/server/db_schema/type_def";
import { to_customer } from "./customer_validation";
import { to_technician } from "./technician_validation";
import { valiDate } from "../semantic/date";

export function to_appointment(t: unknown): Appointment | DataError {
    const context = "Casting to Appointment";
    if (!is_object(t)) {
        return data_error(context, "not an object");
    }

    if (
        !(
            "id" in t &&
            "customer" in t &&
            "date" in t &&
            "time" in t &&
            "duration" in t &&
            "salon" in t &&
            "details" in t
        )
    ) {
        return data_error(context, "missing field");
    }

    const { id, customer, date, time, salon, duration, details } = t;

    const cust = to_customer(customer);
    if (is_data_error(cust))
        return cust.stack(context, "failed to cast customer");
    if (
        !(
            is_string(id) &&
            is_string(salon) &&
            is_string(date) &&
            is_number(time) &&
            is_number(duration) &&
            is_string(details)
        )
    ) {
        return data_error(context, "wrong field type");
    }

    if (!("technician" in t)) {
        return {
            id: id,
            customer: cust,
            salon: salon,
            date: date,
            time: time,
            duration: duration,
            details: details,
            technician: null,
        };
    }

    if (t.technician == null) {
        return {
            id: id,
            customer: cust,
            salon: salon,
            date: date,
            time: time,
            duration: duration,
            details: details,
            technician: null,
        };
    }
    const technician = to_technician(t.technician);

    if (is_data_error(technician))
        return technician.stack(context, "failed to cast technician");

    return {
        id: id,
        customer: cust,
        salon: salon,
        date: date,
        time: time,
        duration: duration,
        details: details,
        technician: technician,
    };
}

export function to_appointment_entry(t: unknown): AppointmentEntry | DataError {
    if (!is_object(t)) {
        return data_error("Casting to AppointmentEntry", "not an object");
    }

    if (
        !(
            "id" in t &&
            "customer_id" in t &&
            "date" in t &&
            "time" in t &&
            "duration" in t &&
            "salon" in t &&
            "details" in t
        )
    ) {
        return data_error("Casting to AppointmentEntry", "missing field");
    }

    const { id, customer_id, date, time, salon, duration, details } = t;

    if (
        !(
            is_string(id) &&
            is_string(customer_id) &&
            is_string(salon) &&
            is_string(date) &&
            is_number(time) &&
            is_number(duration) &&
            is_string(details)
        )
    ) {
        return data_error("Casting to AppointmentEntry", "wrong field type");
    }

    if (time < 1 || time > 52) {
        return data_error(
            "Casting to AppointmentEntry",
            "appointment time out of range",
        );
    }

    if (!("technician_id" in t)) {
        return {
            id: id,
            customer_id: customer_id,
            technician_id: null,
            date: date,
            salon: salon,
            time: time,
            duration: duration,
            details: details,
        };
    }

    const { technician_id } = t;

    if (!is_string(technician_id)) {
        return data_error(
            "Casting to AppointmentEntry",
            "technician_id is not string",
        );
    }

    return {
        id: id,
        customer_id: customer_id,
        technician_id: technician_id,
        salon: salon,
        date: date,
        time: time,
        duration: duration,
        details: details,
    };
}

export function to_appointment_creation_info(
    t: unknown,
): AppointmentCreationInfo | DataError {
    const context = `Casting {${t}} to Appointment Creation Info`;
    if (!is_object(t)) {
        return data_error(context, "not an object");
    }

    if (
        !(
            "customer" in t &&
            "date" in t &&
            "time" in t &&
            "duration" in t &&
            "salon" in t &&
            "details" in t
        )
    ) {
        return data_error(context, "missing field");
    }

    const { customer, date, time, salon, duration, details } = t;

    const cust = to_customer(customer);
    if (is_data_error(cust))
        return cust.stack(context, "failed to cast customer");

    if (
        !(
            is_string(salon) &&
            is_number(time) &&
            is_number(duration) &&
            is_string(details)
        )
    ) {
        return data_error(context, "wrong field type");
    }

    const validated_date = valiDate(date);

    if (is_data_error(validated_date))
        return validated_date.stack(context, "date error");

    return {
        customer: cust,
        date: validated_date,
        time: time,
        duration: duration,
        details: details,
        salon: salon,
    };
}
