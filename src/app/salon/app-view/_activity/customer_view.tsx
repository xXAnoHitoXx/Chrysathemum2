import { Dispatch, SetStateAction, useState } from "react";
import {
    CustomerSearch,
    LastCustomerSave,
} from "../_components/customer_search";
import {
    Appointment,
    Customer,
    Transaction,
} from "~/server/db_schema/type_def";
import { CustomerEdit } from "./_customer_view/customer_edit";
import { Button } from "@nextui-org/button";
import { useQuery } from "@tanstack/react-query";

export type SavedCustomerHistory = {
    id: string;
    appointments: Appointment[];
    transactions: Transaction[];
};

const useCustomerHistory = (
    saved_list: SavedCustomerHistory,
    customer: Customer,
): [Appointment[], Transaction[]] => {
    if (saved_list.id !== customer.id) {
        saved_list.id = customer.id;
        saved_list.appointments = [];
        saved_list.transactions = [];
    }
    const [appointments, set_appointments] = useState<Appointment[]>(
        saved_list.appointments,
    );

    const [transactions, set_transactions] = useState<Transaction[]>(
        saved_list.transactions,
    );

    useQuery({
        queryFn: () =>
            fetch(app_view_appointment + date, {
                method: Method.GET,
                cache: "no-store",
            }).then(
                handle_react_query_response(
                    to_array(to_appointment),
                    (appointments) => {
                        if (
                            appointments.length > 0 &&
                            appointments[0] != undefined &&
                            appointments[0].date === current_date().toString()
                        )
                            save_current_state(appointments);
                        set_appointments(appointments);
                    },
                    (error) => {
                        if (
                            error.contains([
                                ErrorMessage_BisquitRetrival,
                                ErrorMessage_DoesNotExist,
                            ])
                        ) {
                            router.replace("/");
                        }
                    },
                ),
            ),
        queryKey: ["appointment_list", date],
    });

    return [appointments, transactions];
};
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
