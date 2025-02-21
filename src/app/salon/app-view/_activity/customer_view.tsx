import { useState } from "react";
import {
    CustomerSearch,
    LastCustomerSave,
} from "../_components/customer_search";
import { CustomerEdit } from "./_customer_view/customer_edit";
import { Button } from "@heroui/button";
import { useQuery } from "@tanstack/react-query";
import { Method } from "~/app/api/api_query";
import { CustomerHistory } from "./_customer_view/history";
import { Appointment } from "~/server/appointment/type_def";
import { Transaction } from "~/server/transaction/type_def";
import { Customer } from "~/server/customer/type_def";
import { CustomerHistoryData } from "~/app/api/app_view/customer/history/type_def";

export type SavedCustomerHistory = {
    id: string;
    appointments: Appointment[];
    transactions: Transaction[];
};

export const customer_history_default_save: SavedCustomerHistory = {
    id: "",
    appointments: [],
    transactions: [],
};

const customer_api = "/api/app_view/customer/history";

const useCustomerHistory = (
    saved_list: SavedCustomerHistory,
    customer: Customer | null,
): [Appointment[], Transaction[], boolean] => {
    if (customer != null && saved_list.id !== customer.id) {
        saved_list.id = customer.id;
        saved_list.appointments = [];
        saved_list.transactions = [];
    }

    const [appointments, set_appointments] = useState<Appointment[]>(
        customer == null ? [] : saved_list.appointments,
    );

    const [transactions, set_transactions] = useState<Transaction[]>(
        customer == null ? [] : saved_list.transactions,
    );

    const { isFetching } = useQuery({
        queryFn: async () => {
            if (customer != null) {
                const respones = await fetch(customer_api, {
                    method: Method.POST,
                    cache: "no-store",
                    body: JSON.stringify(customer),
                });

                if (respones.status === 200) {
                    const history = CustomerHistoryData.safeParse(
                        await respones.json(),
                    );

                    if (history.success) {
                        set_appointments(history.data.appointments);
                        set_transactions(history.data.transactions);
                    }
                }
            }

            return 0;
        },
        queryKey: ["customer_data", customer],
    });

    return [appointments, transactions, isFetching];
};

export function CustomerView(props: {
    saved_list: SavedCustomerHistory;
    last_customer_save: LastCustomerSave;
    return: () => void;
}) {
    const [customer, set_customer] = useState<Customer | null>(null);
    const [is_loading, set_loading] = useState(false);

    const [edit_mode, set_edit_mode] = useState(true);

    const [appointments, transactions, isFetching] = useCustomerHistory(
        props.saved_list,
        customer,
    );

    return (
        <div className="flex flex-col w-full h-full">
            <div className="m-1 flex h-fit w-full flex-row-reverse gap-2 border-b-2 border-b-sky-900 p-2">
                <Button
                    color="danger"
                    isLoading={is_loading}
                    onPress={props.return}
                >
                    Return
                </Button>
                <Button
                    color={edit_mode ? "primary" : "secondary"}
                    isLoading={is_loading}
                    onPress={() => set_edit_mode(!edit_mode)}
                >
                    {edit_mode ? "View History" : "Edit Customer"}
                </Button>
            </div>
            {customer == null ? (
                <CustomerSearch
                    save={props.last_customer_save}
                    on_complete={set_customer}
                />
            ) : edit_mode ? (
                <CustomerEdit
                    customer={customer}
                    on_complete={(customer: Customer) => {
                        props.last_customer_save.data = customer;
                    }}
                    set_loading={set_loading}
                />
            ) : isFetching ? (
                <div>... Loading ...</div>
            ) : (
                <CustomerHistory
                    appointments={appointments}
                    transactions={transactions}
                />
            )}
        </div>
    );
}
