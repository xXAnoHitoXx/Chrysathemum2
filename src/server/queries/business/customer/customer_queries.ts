import { Customer, CustomerCreationInfo, CustomerUpdateData } from "~/server/db_schema/type_def";
import { Query, QueryError, ServerQueryData, map, merge, retain_input } from "../../server_queries_monad";
import { create_customer_entry, update_customer_entry } from "../../crud/customer/customer_entry";
import { create_customer_phone_index, delete_customer_phone_index } from "../../crud/customer/customer_phone_index";

export const create_new_customer: Query<ServerQueryData<CustomerCreationInfo>, Customer> =
    async (data: ServerQueryData<CustomerCreationInfo>) : Promise<Customer | QueryError> => {
        const query = data.bind(create_customer_entry)
            .bind(retain_input(create_customer_phone_index));
        return query.unpack();
    }

export const update_customer_info: Query<ServerQueryData<{ customer: Customer, update: CustomerUpdateData }>, Customer> =
    async (
        data: ServerQueryData<{ customer: Customer, update: CustomerUpdateData }>
    ) : Promise<Customer | QueryError> => {
        const delete_index_query = data.bind(map(({ customer }: { customer: Customer }) => (customer)))
            .bind(delete_customer_phone_index)

        const update_target: ServerQueryData<Customer> = data.bind(map(
            ({ customer, update }: { customer: Customer, update: CustomerUpdateData }) => (
                { 
                    id:           customer.id, 
                    name:         (update.name != null)         ? update.name         : customer.name, 
                    phone_number: (update.phone_number != null) ? update.phone_number : customer.phone_number, 
                    notes:        (update.notes != null)        ? update.notes        : customer.notes,
                }
            )
        ))

        const update_query = update_target
            .bind(retain_input(update_customer_entry))
            .bind(retain_input(create_customer_phone_index));

        return merge(update_query, delete_index_query, (customer: Customer) => (customer)).unpack();
    }

export function is_no_book(customer: Customer): boolean {
    const note = customer.notes.concat(" banana ", customer.name).toLowerCase();
    return note.includes("no book") || note.includes("nobook");
}
