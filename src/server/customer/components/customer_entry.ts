import { ServerQuery } from "~/server/server_query";
import {
    Customer,
    CustomerCreationInfo,
    CustomerId,
    CustomerNameSearch,
} from "../type_def";
import {
    DataSnapshot,
    endAt,
    get,
    orderByChild,
    push,
    query,
    remove,
    set,
    startAt,
    update,
} from "firebase/database";
import { CUSTOMER_ROOT, PATH_ENTRIES } from "~/server/fire_db";
import { DataError, is_data_error } from "~/server/data_error";

function customer_entries(id: string | null = null): string[] {
    return id === null
        ? [CUSTOMER_ROOT, PATH_ENTRIES]
        : [CUSTOMER_ROOT, PATH_ENTRIES, id];
}

export const create_customer_entry: ServerQuery<
    CustomerCreationInfo,
    Customer
> = ServerQuery.create_query(async ({ name, phone_number }, f_db) => {
    const context = "Creating Customer entry";
    const id = push(f_db.access(customer_entries()));

    if (id.key == null) {
        return new DataError(
            context + "- failed to create customer entry: null id",
        );
    }

    const customer_entry: Customer = {
        id: id.key,
        name: name,
        phone_number: phone_number,
        notes: "",
    };

    try {
        await set(id, customer_entry);
    } catch (e) {
        return new DataError(context + "- db connection error");
    }

    return customer_entry;
});

export const customer_entries_name_search: ServerQuery<
    CustomerNameSearch,
    (Customer | DataError)[]
> = ServerQuery.create_query(async ({ name_search }, f_db) => {
    const ref = query(
        f_db.access(customer_entries()),
        orderByChild("name"),
        startAt(name_search),
        endAt(name_search + "zzzzzzzz"),
    );

    let data;
    try {
        data = await get(ref);
    } catch {
        return new DataError("customer name search - db connection error");
    }

    if (!data.exists()) return [];

    const customers: (Customer | DataError)[] = [];

    data.forEach((child) => {
        customers.push(Customer.parse(child.val()));
    });

    return customers;
});

export const retrieve_customer_entry: ServerQuery<CustomerId, Customer> =
    ServerQuery.create_query(async ({ customer_id }, f_db) => {
        const context = "Retrieve customer entry";

        let data: DataSnapshot;
        try {
            data = await get(f_db.access(customer_entries(customer_id)));
        } catch (e) {
            return new DataError(context + "- db connection error");
        }

        if (!data.exists()) {
            return new DataError(context + "- customer entry not found");
        }

        const e = Customer.parse(data.val());
        if (is_data_error(e))
            return e.stack(context + `corrupted entry ${customer_id}`);

        return e;
    });

export const update_customer_entry: ServerQuery<Customer, void> =
    ServerQuery.create_query(async (customer, f_db) => {
        try {
            return await update(f_db.access(customer_entries(customer.id)), {
                name: customer.name,
                phone_number: customer.phone_number,
                notes: customer.notes,
            });
        } catch (e) {
            return new DataError(
                "Updating customer entry - db connection error",
            );
        }
    });

export const delete_customer_entry: ServerQuery<CustomerId, void> =
    ServerQuery.create_query(async ({ customer_id }, f_db) => {
        try {
            return await remove(f_db.access(customer_entries(customer_id)));
        } catch (e) {
            return new DataError(
                "Deleting customer entry - db connection error",
            );
        }
    });
