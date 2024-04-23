import { d_db } from "./db";
import { f_db } from "./db";
import { get, ref } from "firebase/database";
import { create_customer } from "./customer_queries";
import type { Customer } from "./customer_queries";
import { fb_customers } from "./db/schema";

export async function migrate_customers() {

    const happy_path_error_handle = (error : string) => { throw new Error(error) };

    const snapshot = await get(ref(f_db, "customer/id"));

    snapshot.forEach((child) => {
        const fb_customer : { id : string, name: string, phoneNumber: string } = child.val() as { id : string, name: string, phoneNumber: string };
        
        create_customer(String(fb_customer.name), String(fb_customer.phoneNumber)).then((c) => {
            const customer : Customer = c[0]!;

            d_db.insert(fb_customers).values({ id: fb_customer.id, customer_id: customer.id }).then(null, happy_path_error_handle);
        }, happy_path_error_handle);

        console.log(fb_customer.name);
    });

    console.log("done");

}
