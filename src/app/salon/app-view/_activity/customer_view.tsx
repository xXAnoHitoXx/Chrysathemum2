import { useState } from "react";
import {
    CustomerSearch,
    LastCustomerSave,
} from "../_components/customer_search";
import { Customer } from "~/server/db_schema/type_def";

export function CustomerFinder(props: {
    last_customer_save: LastCustomerSave;
}) {
    const [customer, set_customer] = useState<Customer | null>(null);

    return (
        <div className="flex flex-1 flex-col overflow-y-auto">
            {customer == null ? (
                <CustomerSearch
                    save={props.last_customer_save}
                    on_complete={set_customer}
                />
            ) : null}
        </div>
    );
}
