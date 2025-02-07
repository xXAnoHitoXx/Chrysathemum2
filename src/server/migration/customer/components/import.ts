import { get } from "firebase/database";
import { ServerQuery } from "~/server/server_query";
import { OldCustomerEntry } from "./type_def";
import { DataError } from "~/server/data_error";

export const import_customers_from_old_db: ServerQuery<any, (OldCustomerEntry | DataError)[]> =
    ServerQuery.create_query(async (_, fire_db) => {

        const ref = fire_db.old_db(["customer", "id"])
        const snapshot = await get(ref);

        const customers: (OldCustomerEntry | DataError)[] = [];

        snapshot.forEach((child_snapshot) => {
            const customer = OldCustomerEntry.safeParse(child_snapshot.val());

            if(customer.success) {
                customers.push(customer.data);
            } else {
                customers.push(new DataError(customer.error.message));
            }
        })

        return customers;
    });
