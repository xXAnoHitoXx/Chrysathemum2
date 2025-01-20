import { ServerQuery, ServerQueryData } from "../server_query";
import { create_customer_entry } from "./components/customer_entry";
import { create_customer_phone_index } from "./components/customer_phone_index";
import { Customer, CustomerCreationInfo } from "./type_def";

export class CustomerQuery {
    static create_new_customer: ServerQuery<CustomerCreationInfo, Customer> =
        async (inf, f_db) =>
            ServerQueryData.pack(inf, f_db)
                .bind(create_customer_entry)
                .bind((customer) =>
                    ServerQueryData.pack(customer, f_db)
                        .bind(create_customer_phone_index)
                        .bind(() => customer)
                        .unpack(),
                )
                .unpack();
}
