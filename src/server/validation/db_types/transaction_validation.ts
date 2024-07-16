import { TransactionEntry } from "~/server/db_schema/type_def";
import { is_number, is_object, is_string } from "../simple_type";
import { data_error, DataError } from "~/server/data_error";

export function to_transaction(t: unknown): TransactionEntry | DataError {
    if (!is_object(t)) {
        return data_error( "Casting to TransactionEntry", "not an object", );
    }

    if (!("id" in t && "customer_id" in t && "technician_id" in t
        && "date" in t && "time" in t && "details" in t
        && "amount" in t && "tip" in t && "cash" in t
        && "gift" in t && "discount" in t
    )) {
        return data_error( "Casting to TransactionEntry", "missing field", );
    }

    const {
        id, customer_id, technician_id, date, time, details, 
        amount, tip, cash, gift, discount,
    } = t;

    if (!(is_string(id) && is_string(customer_id) && is_string(technician_id)
        && is_number(date) && is_number(time) && is_string(details)
        && is_number(amount) && is_number(tip) && is_number(cash)
        && is_number(gift) && is_number(discount)
    )) {
        return data_error( "Casting to TransactionEntry", "wrong field type", );
    }

    return { id: id, customer_id: customer_id, technician_id: technician_id,
        date: date, time: time, details: details, amount: amount, tip: tip,
        cash: cash, gift: gift, discount: discount,
    };
}
