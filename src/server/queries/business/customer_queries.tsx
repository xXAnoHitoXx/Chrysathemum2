import { type Customer } from "~/server/db_schema/fb_schema";
import { create_customer_entry, update_customer_entry } from "../crud/customer/customer_entry";
import { create_customer_phone_index, delete_customer_phone_index } from "../crud/customer/customer_phone_index";

export async function create_new_customer({ name, phone_number }: { name: string, phone_number: string }, redirect = ""): Promise<Customer> {
    const customer: Customer = await create_customer_entry({ name, phone_number }, redirect);
    await create_customer_phone_index(customer, redirect);

    return customer;
}

export async function update_customer_info(customer: Customer, { name = customer.name, phone_number = customer.phone_number, notes = customer.notes}, redirect = ""): Promise<Customer> {
    
    await delete_customer_phone_index(customer, redirect);

    const update_target: Customer = { id: customer.id, name: name, phone_number: phone_number, notes: notes}; 
    await update_customer_entry(update_target, redirect);

    await create_customer_phone_index(update_target, redirect);

    return update_target;
}
