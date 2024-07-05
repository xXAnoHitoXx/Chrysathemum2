import { OldCustomerData, to_old_customer_data } from "~/app/api/migration/customer/validation";
import { Query, QueryError, ServerQueryData, is_successful_query, merge } from "../../server_queries_monad";
import { create_customer_migration_index, retrieve_customer_id_from_legacy_id } from "../../crud/customer/customer_migration_index";
import { retrieve_customer_entry } from "../../crud/customer/customer_entry";
import { is_string } from "~/server/validation/simple_type";
import { create_new_customer, update_customer_info } from "../../business/customer/customer_queries";
import { Customer } from "~/server/db_schema/type_def";
import { FireDB } from "~/server/db_schema/fb_schema";
import { DataSnapshot, get } from "firebase/database";

export const migrate_customer_data: Query<ServerQueryData<OldCustomerData>, Customer> = 
    async (data: ServerQueryData<OldCustomerData>): Promise<Customer | QueryError> => {
        const id_index = data.bind(async (old_customer_data) => ({ legacy_id: old_customer_data.id }))
            .bind(retrieve_customer_id_from_legacy_id)
        const query = id_index.bind( async ({ customer_id }, f_db): Promise<Customer | QueryError> => {
            if (is_string(customer_id)) {
                const customer = await retrieve_customer_entry({ customer_id: customer_id }, f_db);
                if(is_successful_query(customer)) {
                    return data.bind(async (old_customer_data) => ({
                        customer: customer,
                        update: {
                            name: old_customer_data.name,
                            phone_number: old_customer_data.phoneNumber,
                            notes: null,
                        },
                    })).packed_bind(update_customer_info).unpack();
                }
            }

            const customer_query = data.bind(async (old_customer_data) => ({
                name: old_customer_data.name, 
                phone_number: old_customer_data.phoneNumber,
            })).packed_bind(create_new_customer)

            return merge( data, customer_query, 
                (old_customer_data: OldCustomerData, customer: Customer) => ({ 
                    legacy_id: old_customer_data.id,
                    customer_id: customer.id,
            })).bind(create_customer_migration_index).bind(() => (customer_query.unpack())).unpack();
        })
        return query.unpack();
    }

export const import_customer_from_old_db: Query<void, OldCustomerData[]> = 
    async (_, f_db: FireDB): Promise<OldCustomerData[] | QueryError> => {
        const data_snapshot: DataSnapshot = await get(f_db.old_db(["customer", "id"]));

        const customers: OldCustomerData[] = [];
        data_snapshot.forEach((data) => {
            const customer = to_old_customer_data(data.val());

            if(is_successful_query(customer)) {
                if(customer.name.includes("qt")){
                    customer.name = customer.name.replace("qt", "").replaceAll("  ", " ");
                }

                customers.push(customer);
            }
        });

        return customers;
    }
