import { create_new_customer, update_customer_info } from "~/server/queries/api/customer/customer_queries"
import { create_customer_migration_index, retrieve_customer_id_from_legacy_id } from "~/server/queries/crud/customer/customer_migration_index";
import { retrieve_customer_entry } from "~/server/queries/crud/customer/customer_entry";
import { API_Query } from "../api_queries";
import { QueryError, ServerQueryData } from "../../server_queries_monad";
import { FireDB } from "~/server/db_schema/fb_schema";
import { is_server_error } from "~/server/server_error";
import { Customer } from "~/server/db_schema/type_def";

export type Old_Customer_Data = {
    id: string,
    name: string,
    phoneNumber: string,
}

export const migrate_customer_data: API_Query<Old_Customer_Data, void> =
    async (data: ServerQueryData<Old_Customer_Data>): Promise<ServerQueryData<void>> => {
        const customer_creation_info = data.bind(async (old_customer_data) => ({
            name: old_customer_data.name, 
            phone_number: old_customer_data.phoneNumber,
        }));
     
        async function migrate_as_new_customer(legacy_id: string): Promise<void | QueryError> {
            const new_customer = await create_new_customer(customer_creation_info);
            return await new_customer.bind(async (customer: Customer) => ({ 
                    customer_id: customer.id, 
                    legacy_id: legacy_id, 
            })).bind(create_customer_migration_index).unpack();
        }

        function create_update_info(customer: Customer) {
            return data.bind(async (old_customer_data) => ({
                customer: customer,
                update: {
                    name: old_customer_data.name,
                    phone_number: old_customer_data.phoneNumber,
                    notes: null,
                },
            }));
        }

        return data.bind(async (old_customer_data) => {
            const customer_id: ServerQueryData<{ customer_id: string | null }> = 
                data.bind(async (old_customer_data) => ({ legacy_id: old_customer_data.id }))
                    .bind(retrieve_customer_id_from_legacy_id)

            return await customer_id.bind(async ({ customer_id }: { customer_id: string | null }, f_db: FireDB) => {
                if (customer_id == null) {
                    return migrate_as_new_customer(old_customer_data.id);
                } else {
                    const customer = await retrieve_customer_entry({ id: customer_id }, f_db);
                    if(is_server_error(customer)) {
                        return migrate_as_new_customer(old_customer_data.id);
                    } else {
                        const update = await update_customer_info(create_update_info(customer));
                        return await update.unpack();
                    }
                }
            }).unpack();
        });
    }
/*
export async function migrate_customer_data(old_customer_data: Old_Customer_Data, redirect = "") : Promise<Customer> {
    const customer_entry_id: string | null = await retrieve_customer_id_from_legacy_id(old_customer_data.id, redirect);

    if (customer_entry_id == null) {
        const customer: Customer = await create_new_customer({ name: old_customer_data.name, phone_number: old_customer_data.phoneNumber }, redirect);
        await create_customer_migration_index({ customer_id: customer.id, legacy_id: old_customer_data.id }, redirect);

        return customer;
    }

    const customer: Customer | null = await retrieve_customer_entry(customer_entry_id, redirect);

    if (customer == null) {
        await delete_customer_migration_index(customer_entry_id, redirect);
        
        const customer: Customer = await create_new_customer({ name: old_customer_data.name, phone_number: old_customer_data.phoneNumber }, redirect);
        await create_customer_migration_index({ customer_id: customer.id, legacy_id: old_customer_data.id }, redirect);

        return customer;
    }

    return await update_customer_info(customer, { name: old_customer_data.name, phone_number: old_customer_data.phoneNumber }, redirect);
}

export async function import_customer_from_old_db(): Promise<Old_Customer_Data[]> {
    const data_snapshot: DataSnapshot = await get(ref(f_db, "/customer/id"));

    const customers: Old_Customer_Data[] = [];
    data_snapshot.forEach((data) => {
        const customer: Old_Customer_Data = data.val() as Old_Customer_Data;

        if(customer.name.includes("qt")){
            customer.name = customer.name.replace("qt", "").replaceAll("  ", " ");
        }

        customers.push(customer);
    });

    return customers;
}
*/
