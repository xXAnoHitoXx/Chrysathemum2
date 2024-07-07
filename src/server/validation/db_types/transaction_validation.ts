import { Transaction } from "~/server/db_schema/type_def";
import { TypeConversionError } from "../validation_error";
import { is_number, is_object, is_string } from "../simple_type";

export function to_transaction(t: unknown): Transaction | TypeConversionError {
    if (!is_object(t)) {
        return { error: "unknown is not object" };
    }

    if (!("id" in t && "customer_id" in t && "technician_id" in t
        && "date" in t && "time" in t && "details" in t
        && "amount" in t && "tip" in t && "cash" in t
        && "gift" in t && "discount" in t
    )) {
        return { error: "unknown is contain missing field" };
    }

    const {
        id, customer_id, technician_id, date, time, details, 
        amount, tip, cash, gift, discount,
    } = t;

    if (!(is_string(id) && is_string(customer_id) && is_string(technician_id)
        && is_string(date) && is_number(time) && is_string(details)
        && is_number(amount) && is_number(tip) && is_number(cash)
        && is_number(gift) && is_number(discount)
    )) {
        return { error: "unknown is contain missing field" };
    }

    return { id: id, customer_id: customer_id, technician_id: technician_id,
        date: date, time: time, details: details, amount: amount, tip: tip,
        cash: cash, gift: gift, discount: discount,
    };
}
