import { Button, Input } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { Method } from "~/app/api/api_query";
import { parse_response } from "~/app/api/response_parser";
import { is_data_error } from "~/server/data_error";
import { Customer } from "~/server/db_schema/type_def";
import { to_customer } from "~/server/validation/db_types/customer_validation";
import { format_phone_number } from "~/server/validation/semantic/phone_format";
import { to_array } from "~/server/validation/simple_type";
import { quick_sort } from "~/util/ano_quick_sort";

const History: { LastCustomer: Customer | null } = { LastCustomer: null };

export function CustomerSearch(props: {
    on_complete: (customer: Customer) => void;
}) {
    const [customer_name, set_name] = useState("");
    const [loading, set_loading] = useState(false);
    const [has_searched, set_has_searched] = useState(false);
    const [phone_number, set_phone_number] = useState("");
    const [customers, set_customers] = useState<Customer[]>([]);
    const [customers_display, set_customers_display] = useState<Customer[]>([]);
    const [error, set_error] = useState("");

    useEffect(() => {
        if (customers.length === 0) return;

        function query_score(name: string, query: string): number {
            let scores: number[][] = Array(name.length + 1).fill(
                Array(query.length + 1).fill(0),
            );

            for (let i = 0; i < name.length; i++) {
                for (let j = 0; j < query.length; j++) {
                    if (name.at(i) === query.at(j)) {
                        scores[i + 1]![j + 1] = scores[i]![j]! + 1;
                    } else {
                        scores[i + 1]![j + 1] = Math.max(
                            scores[i]![j + 1]!,
                            scores[i + 1]![j]!,
                        );
                    }
                }
            }

            return scores[name.length]![query.length]!;
        }

        const scores: [number, Customer][] = [];

        customers.forEach((customer) => {
            const score =
                query_score(customer.name, customer_name) +
                query_score(customer.phone_number, phone_number);

            scores.push([score, customer]);
        });

        quick_sort(scores, (a, b) => {
            let compare = b[0] - a[0];
            if (compare == 0) compare = a[1].name.localeCompare(b[1].name);
            return compare;
        });

        const display: Customer[] = [];

        for (let i = 0; i < scores.length; i++) {
            display.push(scores[i]![1]);
        }

        set_customers_display(display);
    }, [customers, customer_name, phone_number]);

    async function search() {
        set_loading(true);
        if (customer_name !== "") {
            const response = await fetch(
                "/api/customer/name/" + customer_name,
                { method: Method.GET },
            );

            const customers = await parse_response(
                response,
                to_array(to_customer),
            );

            if (is_data_error(customers)) {
                customers.report();
                set_error("error retrieving customers, contact Tinn");
                return;
            }

            set_customers(customers);
        } else if ([7, 10, 11].includes(phone_number.length)) {
            let full_phone_number = phone_number;

            if (phone_number.length === 7)
                full_phone_number = "1902" + phone_number;

            if (phone_number.length === 10)
                full_phone_number = "1" + phone_number;
        }
        set_loading(false);
        set_has_searched(true);
    }

    async function create() {
        if (customer_name === "") {
            set_error("customer name must not be empty");
            return;
        }

        const response = await fetch("/api/customer", {
            method: Method.POST,
            body: JSON.stringify({
                name: customer_name,
                phone_number: phone_number,
            }),
        });

        const customer = await parse_response(response, to_customer);

        if (is_data_error(customer)) {
            customer.report();
            set_error("error creating customer, contact Tinn");
            return;
        }

        History.LastCustomer = customer;
        props.on_complete(customer);
    }

    function on_phone_value_change(phone: string) {
        if (phone === "") {
            set_phone_number(phone);
            return;
        }

        const num = parseInt(
            phone
                .replaceAll("-", "")
                .replaceAll(" ", "")
                .replaceAll(")", "")
                .replaceAll("(", ""),
            10,
        );

        if (isNaN(num) || phone.includes(".")) {
            set_error("phone number must be a number");
            return;
        }

        set_phone_number(phone);
    }

    function on_name_value_change(name: string) {
        if (name.includes("/") || name.includes("\\")) {
            set_error("name must not contain / or \\");
        }

        name = name.replaceAll("/", "");
        name = name.replaceAll("\\", "");

        set_name(name);
    }

    return (
        <div className="flex w-full flex-wrap gap-1">
            <div className="flex w-full items-center gap-1 border-b-1 border-t-1 border-b-sky-900 border-t-sky-900 p-2">
                <Button
                    className="justify-self-center"
                    color="primary"
                    size="md"
                    onClick={search}
                    isLoading={loading}
                >
                    Search
                </Button>
                <Input
                    label="name"
                    value={customer_name}
                    onValueChange={on_name_value_change}
                />
                <Input
                    label="phone_number"
                    value={phone_number}
                    onValueChange={on_phone_value_change}
                />
            </div>
            {error !== "" ? <div>{error}</div> : null}
            <div className="flex w-full flex-wrap gap-2 p-2">
                {customers_display.map((customer: Customer) => (
                    <button
                        onClick={() => {
                            History.LastCustomer = customer;
                            props.on_complete(customer);
                        }}
                        className="h-20 w-fit rounded-3xl border-2 border-sky-900 p-3"
                    >
                        {customer.name}
                        <br />
                        {format_phone_number(customer.phone_number)}
                    </button>
                ))}
                {History.LastCustomer == null ? null : (
                    <button
                        onClick={() => {
                            if (History.LastCustomer != null)
                                props.on_complete(History.LastCustomer);
                        }}
                        className="h-20 w-32 rounded-full border-2 border-sky-900 bg-sky-300"
                    >
                        LastCustomer <br />
                        {History.LastCustomer.name}
                        <br />
                        {format_phone_number(History.LastCustomer.phone_number)}
                    </button>
                )}
                {has_searched ? (
                    <button
                        onClick={create}
                        className="h-20 w-32 rounded-full border-2 border-sky-900 bg-sky-300"
                    >
                        Create Customer
                    </button>
                ) : null}
            </div>
        </div>
    );
}
