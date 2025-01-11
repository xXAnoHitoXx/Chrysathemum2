import { Button, Input } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { Customer } from "~/server/db_schema/type_def";
import { LastCustomerSave } from "../customer_search";
import {
    format_phone_input,
    format_phone_number,
} from "~/server/validation/semantic/phone_format";
import { bubble_sort } from "~/util/ano_bubble_sort";

export default function SelectionDisplay(props: {
    save: LastCustomerSave;
    customers: Customer[];
    initial_data: { customer_name: string; phone_number: string };
    on_complete: (customer: Customer) => void;
    create_customer: (customer_name: string, phone_number: string) => void;
    on_return: () => void;
}) {
    const [customer_name, set_customer_name] = useState(
        props.initial_data.customer_name,
    );
    const [customer_phone_number, set_customer_phone_number] = useState(
        props.initial_data.phone_number,
    );

    const [error, set_error] = useState<string | undefined>(undefined);
    const [is_loading, set_is_loaing] = useState(false);

    useEffect(() => {
        if (props.customers.length > 0) {
            function similarity_score(name: string, query: string): number {
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

            const scores: Record<string, number> = {};

            for (let customer of props.customers) {
                scores[customer.id] =
                    similarity_score(customer.name, customer_name) +
                    similarity_score(
                        customer.phone_number,
                        customer_phone_number,
                    );
            }

            bubble_sort(props.customers, (a, b) => {
                let compare = scores[b.id]! - scores[a.id]!;
                if (compare === 0) compare = a.name.localeCompare(b.name);
                if (compare === 0) compare = a.id.localeCompare(b.id);

                return compare;
            });
        }

        const errors: string[] = [];
        if (customer_phone_number === "") {
            errors.push("customer phone number must not be empty");
        } else {
            const num = parseInt(
                customer_phone_number
                    .replaceAll("-", "")
                    .replaceAll(" ", "")
                    .replaceAll(")", "")
                    .replaceAll("(", ""),
                10,
            );

            if (isNaN(num)) {
                errors.push("phone number must be a number");
            } else if (customer_phone_number.includes(".")) {
                errors.push("phone number formatting error");
            } else if (![7, 10, 11].includes(num.toString().length)) {
                errors.push("not a phone number");
            }
        }

        if (customer_name === "") {
            errors.push("customer name must not be empty");
        } else {
            if (customer_name.includes("/") || customer_name.includes("\\")) {
                errors.push("customer name must not have / or \\");
            }
        }

        set_error(errors[0]);
    }, [customer_name, customer_phone_number]);

    return (
        <div className="flex w-full flex-col gap-1">
            <div className="flex w-full items-center gap-1 border-b-1 border-t-1 border-b-sky-900 border-t-sky-900 p-2">
                <Button
                    className="justify-self-center"
                    color="danger"
                    size="md"
                    disabled={is_loading}
                    onPress={props.on_return}
                >
                    Return
                </Button>

                <Input
                    label="name"
                    value={customer_name}
                    onValueChange={set_customer_name}
                />
                <Input
                    label="phone_number"
                    value={format_phone_input(customer_phone_number)}
                    onValueChange={set_customer_phone_number}
                />
            </div>
            <div className="flex w-full flex-wrap gap-2 p-2">
                {props.save.data == null ? null : (
                    <button
                        onClick={() => {
                            set_is_loaing(true);
                            if (props.save.data != null)
                                props.on_complete(props.save.data);
                        }}
                        disabled={is_loading}
                        className="h-20 w-32 rounded-3xl border-2 border-sky-900 bg-sky-300"
                    >
                        LastCustomer <br />
                        {props.save.data.name}
                        <br />
                        {format_phone_number(props.save.data.phone_number)}
                    </button>
                )}
                <button
                    onClick={() => {
                        if (error === undefined) {
                            set_is_loaing(true);
                            props.create_customer(
                                customer_name,
                                customer_phone_number,
                            );
                        }
                    }}
                    disabled={is_loading}
                    className={
                        "h-20 rounded-3xl border-2 bg-sky-300" +
                        (error === undefined
                            ? "border-sky-900"
                            : "border-red-400")
                    }
                >
                    Create Customer
                    <br />
                    {error === undefined ? "" : error}
                </button>
                {props.customers.map((customer: Customer) => (
                    <button
                        onClick={() => {
                            set_is_loaing(true);
                            props.save.data = customer;
                            props.on_complete(customer);
                        }}
                        disabled={is_loading}
                        className="h-20 w-fit rounded-3xl border-2 border-sky-900 p-3"
                    >
                        {customer.name}
                        <br />
                        {format_phone_number(customer.phone_number)}
                    </button>
                ))}
            </div>
        </div>
    );
}
