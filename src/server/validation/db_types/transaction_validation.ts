import { Transaction, TransactionEntry } from "~/server/db_schema/type_def";
import { is_number, is_object, is_string } from "../simple_type";
import { data_error, DataError, is_data_error } from "~/server/data_error";
import { to_customer } from "./customer_validation";
import { to_technician } from "./technician_validation";

export function to_transaction(t: unknown): Transaction | DataError {
    const context = "Casting to Transaction";

    if (!is_object(t)) {
        return data_error(context, "not an object");
    }

    if (
        !(
            "id" in t &&
            "customer" in t &&
            "technician" in t &&
            "date" in t &&
            "time" in t &&
            "details" in t &&
            "amount" in t &&
            "tip" in t &&
            "cash" in t &&
            "gift" in t &&
            "discount" in t &&
            "salon" in t
        )
    ) {
        return data_error(context, "missing field");
    }

    const {
        id,
        customer,
        technician,
        date,
        time,
        details,
        amount,
        tip,
        cash,
        gift,
        discount,
        salon,
    } = t;

    if (
        !(
            is_string(id) &&
            is_string(date) &&
            is_number(time) &&
            is_string(details) &&
            is_number(amount) &&
            is_number(tip) &&
            is_number(cash) &&
            is_number(gift) &&
            is_number(discount) &&
            is_string(salon)
        )
    ) {
        return data_error(context, "wrong field type");
    }

    const v_customer = to_customer(customer);
    if (is_data_error(v_customer)) return v_customer.stack(context, "...");

    const v_technician = to_technician(technician);
    if (is_data_error(v_technician)) return v_technician.stack(context, "...");

    return {
        id: id,
        customer: v_customer,
        technician: v_technician,
        date: date,
        time: time,
        details: details,
        amount: amount,
        tip: tip,
        cash: cash,
        gift: gift,
        discount: discount,
        salon: salon,
    };
}

export function to_transaction_entry(t: unknown): TransactionEntry | DataError {
    if (!is_object(t)) {
        return data_error("Casting to TransactionEntry", "not an object");
    }

    if (
        !(
            "id" in t &&
            "customer_id" in t &&
            "technician_id" in t &&
            "date" in t &&
            "time" in t &&
            "details" in t &&
            "amount" in t &&
            "tip" in t &&
            "cash" in t &&
            "gift" in t &&
            "discount" in t &&
            "salon" in t
        )
    ) {
        return data_error("Casting to TransactionEntry", "missing field");
    }

    const {
        id,
        customer_id,
        technician_id,
        date,
        time,
        details,
        amount,
        tip,
        cash,
        gift,
        discount,
        salon,
    } = t;

    if (
        !(
            is_string(id) &&
            is_string(customer_id) &&
            is_string(technician_id) &&
            is_string(date) &&
            is_number(time) &&
            is_string(details) &&
            is_number(amount) &&
            is_number(tip) &&
            is_number(cash) &&
            is_number(gift) &&
            is_number(discount) &&
            is_string(salon)
        )
    ) {
        return data_error("Casting to TransactionEntry", "wrong field type");
    }

    return {
        id: id,
        customer_id: customer_id,
        technician_id: technician_id,
        date: date,
        time: time,
        details: details,
        amount: amount,
        tip: tip,
        cash: cash,
        gift: gift,
        discount: discount,
        salon: salon,
    };
}
