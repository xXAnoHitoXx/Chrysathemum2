import { CustomerCreationInfo, CustomerUpdateData, type Customer } from "~/server/db_schema/type_def";
import { create_customer_entry, update_customer_entry } from "~/server/queries/crud/customer/customer_entry";
import { create_customer_phone_index, delete_customer_phone_index } from "~/server/queries/crud/customer/customer_phone_index";
import { ServerQueryData, map, merge, retain_input } from "~/server/queries/server_queries_monad";

export async function create_new_customer(data: ServerQueryData<CustomerCreationInfo>)
: Promise<ServerQueryData<Customer>> {
    return data.bind(create_customer_entry)
        .bind(retain_input(create_customer_phone_index));
}

export async function update_customer_info(
    data: ServerQueryData<{ customer: Customer, update: CustomerUpdateData }>
) : Promise<ServerQueryData<void>> {
    const customer: ServerQueryData<Customer> = data.bind(map(({ customer }: { customer: Customer }) => (customer)))
    const result_1 = customer.bind(delete_customer_phone_index);

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

    const result_2 = update_target
        .bind(retain_input(update_customer_entry))
        .bind(create_customer_phone_index)

    return merge(result_1, result_2, () => {});
}

export function is_no_book(customer: Customer): boolean {
    const note = customer.notes.concat(" banana ", customer.name).toLowerCase();
    return note.includes("no book") || note.includes("nobook");
}
