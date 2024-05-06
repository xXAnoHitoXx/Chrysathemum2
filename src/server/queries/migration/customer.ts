import { type Customer } from "~/server/db_schema/fb_schema"
import { create_new_customer } from "../business/customer_queries"
import { create_customer_migration_index } from "../crud/customer/customer_migration_index";

export type Old_Customer_Data = {
    id: string,
    name: string,
    phone_number: string,
}

export async function migrate_customer(old_customer_data: Old_Customer_Data, redirect = "") : Promise<Customer> {
    const customer: Customer = await create_new_customer({ name: old_customer_data.name, phone_number: old_customer_data.phone_number }, redirect);
    await create_customer_migration_index({ customer_id: customer.id, legacy_id: old_customer_data.id }, redirect);

    return customer;
}
