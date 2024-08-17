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
import {
    DataError,
    is_data_error,
    lotta_errors,
    PartialResult,
} from "~/server/data_error";
import { endAt, get, orderByChild, query, startAt } from "firebase/database";
import { to_customer } from "~/server/validation/db_types/customer_validation";

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

export const customer_name_search: Query<
    string,
    PartialResult<Customer[]>
> = async (customer_name_query, f_db) => {
    const ref = query(
        f_db.customer_entries([]),
        orderByChild("name"),
        startAt(customer_name_query),
        endAt(customer_name_query + "zzzzzzzz"),
    );

    const data = await get(ref);

    if (!data.exists()) return { error: null, data: [] };

    const customers: Customer[] = [];
    const errors: DataError[] = [];

    data.forEach((child) => {
        const customer = to_customer(child.val());

        if (is_data_error(customer)) errors.push(customer);
        else customers.push(customer);
    });

    return errors.length == 0
        ? {
              error: null,
              data: customers,
          }
        : {
              error: lotta_errors(
                  `Name search {${customer_name_query}}`,
                  "encountered corrupted entries",
                  errors,
              ),
              data: customers,
          };
};

export const update_customer_info: Query<
    { customer: Customer; update: CustomerUpdateData },
    Customer
> = async ({ customer, update }, f_db) => {
    const context = "Update Customer Info";

    const update_target: Customer = {
        id: customer.id,
        ...update,
    };

    const del_phone_index_query = delete_customer_phone_index(customer, f_db);
    const update_customer_query = update_customer_entry(update_target, f_db);
    const create_phone_index_query = create_customer_phone_index(
        update_target,
        f_db,
    );

    const del_phone_index = await del_phone_index_query;
    const update_customer = await update_customer_query;
    const create_phone_index = await create_phone_index_query;

    if (is_data_error(del_phone_index))
        return del_phone_index.stack(context, "...");

    if (is_data_error(update_customer))
        return update_customer.stack(context, "...");

    if (is_data_error(create_phone_index))
        return create_phone_index.stack(context, "...");

    return update_target;
};

export function is_no_book(customer: Customer): boolean {
    const note = customer.notes.concat(" banana ", customer.name).toLowerCase();
    return note.includes("no book") || note.includes("nobook");
}
