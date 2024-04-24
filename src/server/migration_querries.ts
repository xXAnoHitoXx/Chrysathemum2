import { d_db } from "./db";
import { f_db } from "./db";
import { eq } from "drizzle-orm";
import { get, ref } from "firebase/database";
import { create_customer } from "./customer_queries";
import type { Customer } from "./customer_queries";
import { customers, fb_customers } from "./db/schema";

export async function migrate_customers() {
    const snapshot = await get(ref(f_db, "customer/id"));

    snapshot.forEach((child) => {
        const fb_customer : { id : string, name: string, phoneNumber: string } = child.val() as { id : string, name: string, phoneNumber: string };
        if_is_new_customer(fb_customer);
    });
}

function if_is_new_customer(fb_customer: { id : string, name: string, phoneNumber: string } ) {
         d_db.select({id: fb_customers.customer_id}).from(fb_customers).where(eq(fb_customers.id, fb_customer.id)).then((q) => {
        if (Array.isArray(q)) { 
            if(q.length == 0) { 
                add_customer(fb_customer); 
            } else {
                update_customer(q[0]!.id, fb_customer);
            }
        } 
    }, happy_path_error_handle);
}

function update_customer(id: number, fb_customer: { id : string, name: string, phoneNumber: string }) {
    console.log("updating: ".concat(fb_customer.name));
    d_db.update(customers).set({ name: fb_customer.name, phone_number: fb_customer.phoneNumber }).where(eq(customers.id, id)).then(null, happy_path_error_handle);
}

function add_customer(fb_customer: { id : string, name: string, phoneNumber: string }) {
    create_customer(String(fb_customer.name), String(fb_customer.phoneNumber)).then((c) => {
        const customer : Customer = c[0]!;
        d_db.insert(fb_customers).values({ id: fb_customer.id, customer_id: customer.id })
            .then(
                () => {
                    console.log("linking: ".concat(fb_customer.name)) 
                }, 
                happy_path_error_handle
            ); 
    }, happy_path_error_handle);

}

function happy_path_error_handle(error: string) {
    throw new Error(error);
}
