import { OldCustomerData, to_old_customer_data } from "~/app/api/migration/customer/validation";
import { db_query, Query } from "../../server_queries_monad";
import { create_customer_migration_index, retrieve_customer_id_from_legacy_id } from "../../crud/customer/customer_migration_index";
import { retrieve_customer_entry } from "../../crud/customer/customer_entry";
import { create_new_customer, update_customer_info } from "../../business/customer/customer_queries";
import { Customer } from "~/server/db_schema/type_def";
import { get } from "firebase/database";
import { DataError, is_data_error, lotta_errors, PartialResult } from "~/server/data_error";

export const migrate_customer_data: Query<OldCustomerData, Customer> = 
    async (data, f_db) => {
        const context = "Migrating customer { ".concat(data.name, "-", data.phoneNumber, " }")
        const result = await retrieve_customer_id_from_legacy_id({ legacy_id: data.id }, f_db);

        if(is_data_error(result)) return result.stack(context, "...");

        if(result.customer_id == null) {
            const customer = await create_new_customer({
                name: data.name,
                phone_number: data.phoneNumber,
            }, f_db);

            if(is_data_error(customer)) return customer.stack(context, "...")

            const index = await create_customer_migration_index({
                legacy_id: data.id,
                customer_id: customer.id,
            }, f_db);

            if(is_data_error(index)) return index.stack(context, "...");
            
            return customer;
        }

        const customer = await retrieve_customer_entry({ customer_id: result.customer_id }, f_db);
        if(is_data_error(customer)) return customer.stack(context, "...");
        
        const update = await update_customer_info({
            customer: customer,
            update: {
                name: data.name,
                phone_number: data.phoneNumber,
                notes: null,
            },
        }, f_db);

        if(is_data_error(update)) return update.stack(context, "...")
        return update;
    }

export const import_customer_from_old_db: Query<void, PartialResult<OldCustomerData[]>> = 
    async (_, f_db) => {
        const context = "Import Customers from Old DB";
        const data_snapshot = await db_query(context, get(f_db.old_db(["customer", "id"])));
        if(is_data_error(data_snapshot)) return data_snapshot;

        const customers: OldCustomerData[] = [];
        const errors: DataError[] = [];
    
        data_snapshot.forEach((data) => {
            const customer = to_old_customer_data(data.val());

            if(is_data_error(customer)) {
                errors.push(customer);
            } else {
                if(customer.name.includes("qt")){
                    customer.name = customer.name.replace("qt", "").replaceAll("  ", " ");
                }

                customers.push(customer);
            }
        });

        return {
            data: customers,
            error: lotta_errors(context, "...", errors),
        };
    }
