import { f_db } from "./db";
import { ref, push, set, get, update } from "firebase/database";
import type { DataSnapshot, DatabaseReference } from "firebase/database";
import { fb_customers, fb_customers_phone_index } from "./db/fb_schema";
import type { Customer } from "./db/fb_schema";

export async function create_customer(name: string, phone_number: string) : Promise<Customer>{
    const id : DatabaseReference = await push(ref(f_db, fb_customers));

    if(id.key == null) {
        throw new Error("failed to create customer null id");
    }

    const customer: Customer = {
        id: id.key,
        name: name,
        phone_number: phone_number,
    };

    await set(id, customer);
    await set(ref(f_db, fb_customers_phone_index.concat(phone_number)), id.key);
    
    return customer;
}

export async function read_customer(id: string) : Promise<Customer | null> {
    const data: DataSnapshot = await get(ref(f_db, fb_customers.concat(id)));

    if (!data.exists()) {
        return null;
    }

    return data.val() as Customer;
}

export async function update_customer(customer: Customer) {
    await update(ref(f_db, fb_customers.concat(customer.id)), { name: customer.name, phone_number: customer.phone_number });
}
