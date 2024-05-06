import { type Customer } from "~/server/db_schema/fb_schema"
import { create_new_customer } from "../business/customer_queries"
import { create_customer_migration_index } from "../crud/customer/customer_migration_index";
import { type DataSnapshot, get, ref } from "firebase/database";
import { f_db } from "~/server/db_schema";

export type Old_Customer_Data = {
    id: string,
    name: string,
    phone_number: string,
}

export async function migrate_customer_data(old_customer_data: Old_Customer_Data, redirect = "") : Promise<Customer> {
    const customer: Customer = await create_new_customer({ name: old_customer_data.name, phone_number: old_customer_data.phone_number }, redirect);
    await create_customer_migration_index({ customer_id: customer.id, legacy_id: old_customer_data.id }, redirect);

    return customer;
}

export async function import_customer_from_old_db() {
    const data_snapshot: DataSnapshot = await get(ref(f_db, "/customer/id"));

    const customers: Old_Customer_Data[] = [];
    data_snapshot.forEach((data) => {
        customers.push(data.val() as Old_Customer_Data);
    });

    await Promise.all( customers.map( customer => migrate_customer_data(customer) ) );
}
