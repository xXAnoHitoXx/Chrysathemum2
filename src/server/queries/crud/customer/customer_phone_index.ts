import 'server-only';

import type { Customer } from '~/server/db_schema/type_def';
import { db_query, Query } from '../../server_queries_monad';
import { is_string } from '~/server/validation/simple_type';
import { data_error, DataError, is_data_error, lotta_errors, PartialResult } from '~/server/data_error';
import { get, remove, set } from 'firebase/database';

export const create_customer_phone_index: Query<Customer, void> = 
    async (customer, f_db) => {
        return db_query(
            "Creating phone index for Customer { ".concat(customer.name, " }"),
            set(f_db.customers_phone_index([customer.phone_number, customer.id]), customer.id),
        );
    }

export const retrieve_customer_phone_index: Query<{ phone_number: string }, PartialResult<{customer_ids: string[]}>> =
    async ({ phone_number }, f_db) => {
        const context = "Retrieving customers with phone number { ".concat(phone_number, " }");
        const index: string[] = [];
        const error: DataError[] = [];

        const data = await db_query(context, get(f_db.customers_phone_index([phone_number])));
        if(is_data_error(data)) return data;

        if(data.exists()) {
            data.forEach((child) => {
                const val: unknown = child.val();
                if(is_string(val)) {
                    index.push(val);
                } else {
                    error.push(data_error( 
                        "Parsing entry { ".concat(child.key, " }"), 
                        "corrupted, not a string",
                    ));
                }
            })
        }

        return {
            data: { customer_ids: index },
            error: (error.length == 0)?
                null : lotta_errors(context, "index contained some corrupted entries", error), 
        }
    }

export const delete_customer_phone_index: Query<Customer, void> = 
    async (customer, f_db) => {
        return db_query(
            "Deleting customer phone index { ".concat(customer.phone_number, " }"),
            remove(f_db.customers_phone_index([customer.phone_number, customer.id]))
        );
    }
