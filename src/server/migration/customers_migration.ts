import { f_db } from "../db";
import { ref, set, get } from "firebase/database";
import type { DataSnapshot } from "firebase/database";
import { fb_customers_legacy_id_index } from "../db/fb_schema";
import { update_customer, create_customer } from "../queries/customers";

export async function migrate_customers() {
    const snapshot = await get(ref(f_db, "customer/id"));

    snapshot.forEach((child) => {
        const old_customer_entry : { id : string, name: string, phoneNumber: string } = child.val() as { id : string, name: string, phoneNumber: string };

        transfer_old_customer(old_customer_entry.id, old_customer_entry.name, old_customer_entry.phoneNumber)
            .then(() => {
                console.log("processed: ".concat(old_customer_entry.name));
            }, (error: string) => {
                throw new Error(error);
            });
    });
}

export async function transfer_old_customer(old_id: string, name: string, phone_number: string){
    const data: DataSnapshot = await get(ref(f_db, fb_customers_legacy_id_index.concat(old_id)));

    if(data.exists()) {
        await update_customer({ id: data.val() as string, name: name, phone_number: phone_number });
    } else {
        const customer = await create_customer(name, phone_number);
        await set(ref(f_db, fb_customers_legacy_id_index.concat(old_id)), customer.id);
    }
}

