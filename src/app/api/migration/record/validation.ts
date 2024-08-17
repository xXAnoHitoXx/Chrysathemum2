import { data_error, DataError } from "~/server/data_error";
import {
    is_number,
    is_object,
    is_string,
} from "~/server/validation/simple_type";

export type OldRecord = {
    id: number;
    amount: string;
    appointmentTime: string;
    customerID: number;
    date: string;
    duration: string;
    services: string;
    technicianID: number;
    tip: string;
};

export function to_old_Record(t: unknown, id: number): OldRecord | DataError {
    const context = "Casting to OldRecord";
    if (!is_object(t)) {
        return data_error(context, "not an object");
    }

    if (
        !(
            "amount" in t &&
            "appointmentTime" in t &&
            "customerID" in t &&
            "date" in t &&
            "duration" in t &&
            "services" in t &&
            "technicianID" in t &&
            "tip" in t
        )
    ) {
        return data_error(context, "missing fields");
    }

    const {
        amount,
        appointmentTime,
        date,
        duration,
        services,
        tip,
        technicianID,
        customerID,
    } = t;

    if (
        !(
            is_string(amount) &&
            is_string(appointmentTime) &&
            is_string(date) &&
            is_string(duration) &&
            is_string(services) &&
            is_string(tip) &&
            is_number(technicianID) &&
            is_number(customerID)
        )
    ) {
        return data_error(context, "wrong field types");
    }

    return {
        id: id,
        appointmentTime: appointmentTime,
        date: date,
        duration: duration,
        services: services,
        amount: amount,
        tip: tip,
        technicianID: technicianID,
        customerID: customerID,
    };
}
