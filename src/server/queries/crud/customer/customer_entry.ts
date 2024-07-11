import 'server-only';

import type { Customer } from '~/server/db_schema/type_def';
import { db_query, Query } from '../../server_queries_monad';
import { to_customer } from '~/server/validation/db_types/customer_validation';
import { data_error, is_data_error } from '~/server/data_error';
import { get, push, remove, set, update } from 'firebase/database';

export const create_customer_entry: Query<{name: string, phone_number: string}, Customer> = 
    async ({ name, phone_number }, f_db) => {
        const context = "Creating Customer entry";
        const id = push(f_db.customer_entries([]));
        
        if(id.key == null) {
            return data_error(context, "failed to create customer entry: null id");
        }
        
        const customer_entry: Customer = {
            id: id.key,
            name: name,
            phone_number: phone_number,
            notes: "",
        };
     
        const e = await db_query(context, set(id, customer_entry)); 
        if(is_data_error(e)) return e;

        return customer_entry;
    }

export const retrieve_customer_entry: Query<{ customer_id: string }, Customer> = 
    async ({ customer_id }, f_db) => {
        const context = "Retrieve customer entry";

        const data = await db_query(context, get(f_db.customer_entries([customer_id])));
        if (is_data_error(data)) return data;

        if (!data.exists()) {
            return data_error(context, "customer entry not found");
        }

        const e = to_customer(data.val());
        if (is_data_error(e))
            return e.stack(context, "corrupted entry { ".concat(customer_id, " }"))

        return e;
    }

export const update_customer_entry: Query<Customer, void> =
    async (customer, f_db) => {
        return db_query(
            "Updating customer entry",
            update(f_db.customer_entries([customer.id]), { 
                name: customer.name, 
                phone_number: customer.phone_number, 
                notes: customer.notes 
            })
        );
    }

export const delete_customer_entry: Query<{ id: string }, void> =
    async ({ id }, f_db) => {
        return db_query(
            "Deleting customer entry",
            remove(f_db.customer_entries([id])) 
        );
    }
