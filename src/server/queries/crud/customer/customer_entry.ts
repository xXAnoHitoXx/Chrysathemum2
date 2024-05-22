import 'server-only';

import { f_db } from "~/server/db_schema";
import { ref, push, set, get, update, remove } from "firebase/database";
import type { DataSnapshot, DatabaseReference } from "firebase/database";
import { fb_customer_entries } from "~/server/db_schema/fb_schema";
import type { Customer } from '~/server/db_schema/type_def';

export async function create_customer_entry({name, phone_number}: {name: string, phone_number: string}, redirect: string) : Promise<Customer>{
    const id : DatabaseReference = await push(ref(f_db, fb_customer_entries(redirect)));

    if(id.key == null) {
        throw new Error("failed to create customer_entry null id");
    }

    const customer_entry: Customer = {
        id: id.key,
        name: name,
        phone_number: phone_number,
        notes: "",
    };
 
    await set(id, customer_entry);
    return customer_entry;
}

export async function retrieve_customer_entry(id: string, redirect: string) : Promise<Customer | null> {
    const data: DataSnapshot = await get(ref(f_db, fb_customer_entries(redirect).concat(id)));

    if (!data.exists()) {
        return null;
    }

    return data.val() as Customer;
}

export async function update_customer_entry(customer: Customer, redirect: string) {
    await update(ref(f_db, fb_customer_entries(redirect).concat(customer.id)), { name: customer.name, phone_number: customer.phone_number, notes: customer.notes });
}

export async function delete_customer_entry(id: string, redirect: string) {
    await remove(ref(f_db, fb_customer_entries(redirect).concat(id)));
}
