import { useState } from "react";
import { Customer } from "~/server/db_schema/type_def";
import { SearchQueryInput } from "./customer_search/search_input";
import { useMutation, useQuery } from "@tanstack/react-query";
import SelectionDisplay from "./customer_search/selection";
import {
    create_customer,
    name_search,
    phone_search,
} from "./customer_search/queries";

export type LastCustomerSave = {
    data: Customer | null;
};

export const last_customer_default_save: LastCustomerSave = {
    data: null,
};

enum State {
    Input,
    SearchName,
    SearchPhone,
}

export function CustomerSearch(props: {
    save: LastCustomerSave;
    on_complete: (customer: Customer) => void;
}) {
    const [state, set_state] = useState(State.Input);
    const [input, set_input] = useState<string>("");

    const search_result = useQuery({
        queryFn: async ({
            queryKey,
        }: {
            queryKey: [string, { state: State; input: string }];
        }) => {
            const [_key, { state, input }] = queryKey;
            if (state === State.SearchPhone) {
                return phone_search(input);
            } else if (state === State.SearchName) {
                return name_search(input);
            }

            return Promise.reject();
        },
        queryKey: ["customer search", { state: state, input: input }],
        enabled: state === State.SearchPhone || state === State.SearchName,
    });

    const new_customer = useMutation({
        mutationFn: create_customer,
    });

    if (state === State.Input) {
        return (
            <SearchQueryInput
                save={props.save}
                search_name={(customer_name) => {
                    set_input(customer_name);
                    set_state(State.SearchName);
                }}
                search_phone_number={(phone_number) => {
                    set_input(phone_number);
                    set_state(State.SearchPhone);
                }}
                last_customer={() => props.on_complete(props.save.data!)}
            />
        );
    }

    if (search_result.isLoading) {
        return <span>Loading...</span>;
    }

    if (search_result.isError) {
        return <span>Error: {search_result.error.message}</span>;
    }

    // We can assume by this point that `isSuccess === true`
    return (
        <SelectionDisplay
            save={props.save}
            on_complete={props.on_complete}
            customers={
                search_result.data === undefined ? [] : search_result.data
            }
            initial_data={
                state === State.SearchName
                    ? {
                          customer_name: input,
                          phone_number: "",
                      }
                    : {
                          customer_name: "",
                          phone_number: input,
                      }
            }
            on_return={() => {
                set_input("");
                set_state(State.Input);
            }}
            create_customer={(customer_name, phone_number) => {
                new_customer.mutate({
                    customer_name: customer_name,
                    phone_number: phone_number,
                });
            }}
        />
    );
}
