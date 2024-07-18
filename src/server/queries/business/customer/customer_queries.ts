import {
    Customer,
    CustomerCreationInfo,
    CustomerUpdateData,
} from "~/server/db_schema/type_def";
import { Query } from "../../server_queries_monad";
import {
    create_customer_entry,
    update_customer_entry,
} from "../../crud/customer/customer_entry";
import {
    create_customer_phone_index,
    delete_customer_phone_index,
} from "../../crud/customer/customer_phone_index";
import { is_data_error } from "~/server/data_error";

export const create_new_customer: Query<
    CustomerCreationInfo,
    Customer
> = async (data, f_db) => {
    const context = "Create New Customer";

    const customer = await create_customer_entry(data, f_db);
    if (is_data_error(customer)) return customer.stack(context, "...");

    const index = create_customer_phone_index(customer, f_db);
    if (is_data_error(index)) return index.stack(context, "...");

    return customer;
};

export const update_customer_info: Query<
    { customer: Customer; update: CustomerUpdateData },
    Customer
> = async ({ customer, update }, f_db) => {
    const context = "Update Customer Info";
    const del_phone_index = await delete_customer_phone_index(customer, f_db);
    if (is_data_error(del_phone_index))
        return del_phone_index.stack(context, "...");

    const update_target: Customer = {
        id: customer.id,
        name: update.name != null ? update.name : customer.name,
        phone_number:
            update.phone_number != null
                ? update.phone_number
                : customer.phone_number,
        notes: update.notes != null ? update.notes : customer.notes,
    };

    const update_customer = update_customer_entry(update_target, f_db);
    if (is_data_error(update_customer))
        return update_customer.stack(context, "...");

    const create_phone_index = await create_customer_phone_index(
        update_target,
        f_db,
    );
    if (is_data_error(create_phone_index))
        return create_phone_index.stack(context, "...");

    return update_target;
};

export function is_no_book(customer: Customer): boolean {
    const note = customer.notes.concat(" banana ", customer.name).toLowerCase();
    return note.includes("no book") || note.includes("nobook");
}
