import { type Customer } from "~/server/db_schema/fb_schema";
import { create_customer_entry } from "../crud/customer/customer_entry";
import { create_customer_phone_index } from "../crud/customer/customer_phone_index";

export async function create_new_customer({ name, phone_number }: { name: string, phone_number: string }, redirect = ""): Promise<Customer> {
    const customer: Customer = await create_customer_entry({ name, phone_number }, redirect);
    await create_customer_phone_index(customer, redirect);

    return customer;
}
