import { useState } from "react";
import {
    CustomerSearch,
    LastCustomerSave,
} from "../_components/customer_search";
import { Customer } from "~/server/db_schema/type_def";
import { CustomerEdit } from "./_customer_view/customer_edit";
import { Button } from "@nextui-org/button";

export function CustomerView(props: {
    last_customer_save: LastCustomerSave;
    return: () => void;
}) {
    const [customer, set_customer] = useState<Customer | null>(null);
    const [is_loading, set_loading] = useState(false);

    return (
        <div className="flex flex-1 flex-col overflow-y-auto">
            <div className="m-1 flex h-fit w-full flex-row-reverse border-t-2 border-t-sky-900 p-1">
                <Button
                    color="danger"
                    isLoading={is_loading}
                    onClick={props.return}
                >
                    Return
                </Button>
            </div>
            {customer == null ? (
                <CustomerSearch
                    save={props.last_customer_save}
                    on_complete={set_customer}
                />
            ) : (
                <CustomerEdit
                    customer={customer}
                    on_complete={(customer) => {
                        props.last_customer_save.data = customer;
                    }}
                    set_loading={set_loading}
                />
            )}
        </div>
    );
}
