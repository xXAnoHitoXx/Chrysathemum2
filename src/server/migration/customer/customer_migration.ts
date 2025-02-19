import { ServerQuery } from "~/server/server_query";
import { OldCustomerEntry } from "./components/type_def";
import {
    create_customer_migration_index,
    retrieve_customer_id_from_legacy_id,
} from "./components/migration_index";
import { CustomerQuery } from "~/server/customer/customer_queries";
import { Customer } from "~/server/customer/type_def";

export const migrate_customer_data: ServerQuery<OldCustomerEntry, void> =
    ServerQuery.from_builder((data) =>
        ServerQuery.create_query((_) => {
            return { legacy_id: data.id.toString(10) };
        })
            .chain<{ customer_id: string | null }>(
                retrieve_customer_id_from_legacy_id,
            )
            .chain(
                ServerQuery.from_builder((index) => {
                    if (index.customer_id === null) {
                        return ServerQuery.create_query((_) => {
                            return {
                                name: data.name,
                                phone_number: data.phoneNumber.toString(10),
                            };
                        })
                            .chain<Customer>(CustomerQuery.create_new_customer)
                            .chain<{ customer_id: string; legacy_id: string }>(
                                (customer) => {
                                    return {
                                        customer_id: customer.id,
                                        legacy_id: data.id.toString(10),
                                    };
                                },
                            )
                            .chain(create_customer_migration_index);
                    } else {
                        return ServerQuery.create_query(() => {});
                    }
                }),
            ),
    );
