import { DataError, is_data_error, report_partial_errors } from "../data_error";
import { array_query, ServerQuery } from "../server_query";
import {
    create_customer_entry,
    customer_entries_name_search,
    retrieve_customer_entry,
    update_customer_entry,
} from "./components/customer_entry";
import {
    create_customer_phone_index,
    delete_customer_phone_index,
    retrieve_customer_phone_index,
} from "./components/customer_phone_index";
import {
    Customer,
    CustomerCreationInfo,
    CustomerId,
    CustomerNameSearch,
    CustomerPhoneSearch,
    CustomerUpdateInfo,
} from "./type_def";

export class CustomerQuery {
    static create_new_customer: ServerQuery<CustomerCreationInfo, Customer> =
        create_customer_entry.chain<Customer>(
            ServerQuery.from_builder((customer) =>
                create_customer_phone_index.chain<Customer>(() => customer),
            ),
        );

    static name_search: ServerQuery<CustomerNameSearch, Customer[]> =
        customer_entries_name_search.chain<Customer[]>(report_partial_errors);

    static phone_search: ServerQuery<CustomerPhoneSearch, Customer[]> =
        retrieve_customer_phone_index
            .chain<string[]>(report_partial_errors)
            .chain<CustomerId[]>((arr) =>
                arr.map((id) => {
                    return { customer_id: id };
                }),
            )
            .chain<Customer[]>(array_query(retrieve_customer_entry));

    static update_customer_info: ServerQuery<CustomerUpdateInfo, Customer> =
        ServerQuery.create_query(async ({ customer, update }, f_db) => {
            const update_target = {
                id: customer.id,
                ...update,
            };
            const delete_query = delete_customer_phone_index.call(
                customer,
                f_db,
            );
            const update_query = update_customer_entry.call(
                update_target,
                f_db,
            );
            const create_index = create_customer_phone_index.call(
                update_target,
                f_db,
            );

            const delete_res = await delete_query;
            const update_res = await update_query;
            const create_res = await create_index;

            if (
                is_data_error(delete_res) ||
                is_data_error(update_res) ||
                is_data_error(create_res)
            ) {
                let message = "";
                if (is_data_error(delete_res)) message = delete_res.message();
                if (is_data_error(update_res)) message += update_res.message();
                if (is_data_error(create_res)) message += create_res.message();
                return new DataError(message);
            }

            return update_target;
        });
}
