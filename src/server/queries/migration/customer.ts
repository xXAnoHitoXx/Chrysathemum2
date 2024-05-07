import { type Customer } from "~/server/db_schema/fb_schema"
import { create_new_customer, update_customer_info } from "../business/customer_queries"
import { create_customer_migration_index, delete_customer_migration_index, retrieve_customer_id_from_legacy_id } from "../crud/customer/customer_migration_index";
import { type DataSnapshot, get, ref } from "firebase/database";
import { f_db } from "~/server/db_schema";
import { retrieve_customer_entry } from "../crud/customer/customer_entry";

export type Old_Customer_Data = {
    id: string,
    name: string,
    phoneNumber: string,
}

export async function migrate_customer_data(old_customer_data: Old_Customer_Data, redirect = "") : Promise<Customer> {
    const customer_entry_id: string | null = await retrieve_customer_id_from_legacy_id(old_customer_data.id, redirect);

    if (customer_entry_id == null) {
        const customer: Customer = await create_new_customer({ name: old_customer_data.name, phone_number: old_customer_data.phoneNumber }, redirect);
        await create_customer_migration_index({ customer_id: customer.id, legacy_id: old_customer_data.id }, redirect);

        return customer;
    }

    const customer: Customer | null = await retrieve_customer_entry(customer_entry_id, redirect);

    if (customer == null) {
        await delete_customer_migration_index(customer_entry_id, redirect);
        
        const customer: Customer = await create_new_customer({ name: old_customer_data.name, phone_number: old_customer_data.phoneNumber }, redirect);
        await create_customer_migration_index({ customer_id: customer.id, legacy_id: old_customer_data.id }, redirect);

        return customer;
    }

    return await update_customer_info(customer, { name: old_customer_data.name, phone_number: old_customer_data.phoneNumber }, redirect);
}

export async function import_customer_from_old_db(redirect = "") {
    const data_snapshot: DataSnapshot = await get(ref(f_db, "/customer/id"));

    const customers: Old_Customer_Data[] = [];
    data_snapshot.forEach((data) => {
        const customer: Old_Customer_Data = data.val() as Old_Customer_Data;

        if(customer.name.includes("qt")){
            customer.name = customer.name.replace("qt", "").replaceAll("  ", " ");
        }

        customers.push(customer);
    });

    await Promise.all( customers.map( customer => migrate_customer_data(customer, redirect) ) );

    console.log("done");
}
