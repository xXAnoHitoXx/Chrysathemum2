import 'server-only';

import { type DataSnapshot, set, get, remove } from "firebase/database";
import { FireDB } from "~/server/db_schema/fb_schema";
import type { Customer } from '~/server/db_schema/type_def';
import { Query } from '../../queries_monad';

export const create_customer_phone_index: Query<Customer, void> = 
    async (customer: Customer, f_db: FireDB): Promise<void> => {
        await set(f_db.customers_phone_index([customer.phone_number, customer.id]), customer.id);
    }

export const retrieve_customer_phone_index: Query<{ phone_number: string }, { customer_ids: string[] }> =
    async (params: { phone_number: string }, f_db: FireDB): Promise<{ customer_ids: string[] }> => {
        const index: string[] = [];

        const data: DataSnapshot = await get(f_db.customers_phone_index([params.phone_number]));

        if(data.exists()) {
            data.forEach((child) => {
                index.push(child.val() as string);
            });
        }
 
        return { customer_ids: index };
    }

export const delete_customer_phone_index: Query<Customer, void> = 
    async (customer: Customer, f_db: FireDB): Promise<void> => {
        await remove(f_db.customers_phone_index([customer.phone_number, customer.id]));
    }
