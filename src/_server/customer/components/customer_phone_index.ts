import { DataSnapshot, get, remove, set } from "firebase/database";
import { ServerQuery } from "~/_server/server_query";
import { Customer } from "../type_def";
import { DataError } from "~/_server/generic_query/data_error";
import { is_string } from "~/_server/validation/simple_types";
import { CUSTOMER_ROOT, PHONE_INDEX } from "~/_server/fire_db";

function phone_index(
    phone_number: string,
    customer_id: string | null = null,
): string[] {
    return customer_id === null
        ? [CUSTOMER_ROOT, PHONE_INDEX, phone_number]
        : [CUSTOMER_ROOT, PHONE_INDEX, phone_number, customer_id];
}

export const create_customer_phone_index: ServerQuery<Customer, void> = async (
    customer,
    f_db,
) => {
    try {
        return await set(
            f_db.access(phone_index(customer.phone_number, customer.id)),
            customer.id,
        );
    } catch (e) {
        return new DataError(
            `Creating phone index for Customer ${customer.name} - db connection error`,
        );
    }
};

export const retrieve_customer_phone_index: ServerQuery<
    { phone_number: string },
    (string | DataError)[]
> = async ({ phone_number }, f_db) => {
    let data: DataSnapshot;

    try {
        data = await get(f_db.access(phone_index(phone_number)));
    } catch {
        return new DataError(
            `Retrieving customers with phone number ${phone_number} - db connection error`,
        );
    }

    const index: (string | DataError)[] = [];

    if (data.exists()) {
        data.forEach((child) => {
            const val: unknown = child.val();
            if (is_string(val)) {
                index.push(val);
            } else {
                index.push(
                    new DataError(`corrupted phone index of ${phone_number}`),
                );
            }
        });
    }

    return index;
};

export const delete_customer_phone_index: ServerQuery<Customer, void> = async (
    customer,
    f_db,
) => {
    try {
        await remove(
            f_db.access(phone_index(customer.phone_number, customer.id)),
        );
    } catch {
        return new DataError(
            `Deleting customer phone index ${customer.phone_number}/${customer.id}`,
        );
    }
};
