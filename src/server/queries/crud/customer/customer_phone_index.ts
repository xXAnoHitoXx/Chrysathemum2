import 'server-only';

import { type DataSnapshot, ref, set, get, remove } from "firebase/database";
import { f_db } from "~/server/db_schema";
import { fb_customers_phone_index, type Customer } from "~/server/db_schema/fb_schema";

export async function create_customer_phone_index(customer: Customer, redirect: string) {
    await set(ref(f_db, fb_customers_phone_index(redirect).concat(customer.phone_number, "/", customer.id)), customer.id);
}

export async function retrieve_customer_phone_index(phone_number: string, redirect: string): Promise<string[]> {
    const index: string[] = [];

    const data: DataSnapshot = await get(ref(f_db, fb_customers_phone_index(redirect).concat(phone_number)));

    if(data.exists()) {
        data.forEach((child) => {
            index.push(child.val() as string);
        });
    }

    return index;
}

export async function delete_customer_phone_index(customer: Customer, redirect: string) {
    await remove(ref(f_db, fb_customers_phone_index(redirect).concat(customer.phone_number, "/", customer.id)));
}
