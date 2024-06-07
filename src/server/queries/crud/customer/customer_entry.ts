import 'server-only';

import { push, set, get, update, remove } from "firebase/database";
import type { DataSnapshot, DatabaseReference } from "firebase/database";
import type { Customer } from '~/server/db_schema/type_def';
import { Query, QueryError } from '../../queries_monad';
import { FireDB } from '~/server/db_schema/fb_schema';
import { server_error } from '~/server/server_error';
import { to_customer } from '~/server/validation/db_types/customer_validation';

export const create_customer_entry: Query<{name: string, phone_number: string}, Customer> = 
    async (params: { name: string, phone_number: string }, f_db: FireDB): Promise<Customer | QueryError> => {
        const id: DatabaseReference = await push(f_db.customer_entries([]));
        
        if(id.key == null) {
            return server_error("failed to create customer entry: null id");
        }
        
        const customer_entry: Customer = {
            id: id.key,
            name: params.name,
            phone_number: params.phone_number,
            notes: "",
        };
     
        await set(id, customer_entry);
        return customer_entry;
    }

export const retrieve_customer_entry: Query<{ id: string }, Customer> = 
    async (params: { id: string }, f_db: FireDB): Promise<Customer | QueryError> => {
        const data: DataSnapshot = await get(f_db.customer_entries([params.id]));

        if (!data.exists()) {
            return server_error("customer entry {".concat(params.id, "} not found"));
        }

        return to_customer(data.val());
    }

export const update_customer_entry: Query<Customer, void> =
    async (customer: Customer, f_db: FireDB) => {
        await update(f_db.customer_entries([customer.id]), { 
            name: customer.name, 
            phone_number: customer.phone_number, 
            notes: customer.notes 
        });
    }

export const delete_customer_entry: Query<{ id: string }, void> =
    async (params: { id : string }, f_db: FireDB) => {
        await remove(f_db.customer_entries([params.id]));
    }
