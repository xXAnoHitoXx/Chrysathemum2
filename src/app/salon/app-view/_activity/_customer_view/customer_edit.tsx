import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/react";
import { useState } from "react";
import { Method } from "~/app/api/api_query";
import { handle_react_query_response } from "~/app/api/response_parser";
import { Customer } from "~/server/db_schema/type_def";
import { to_customer } from "~/server/validation/db_types/customer_validation";
import {
    format_phone_input,
    format_phone_number,
} from "~/server/validation/semantic/phone_format";

export function CustomerEdit(props: {
    customer: Customer;
    set_loading: (loading: boolean) => void;
    on_complete: (customer: Customer) => void;
}) {
    const [customer, set_customer] = useState({ ...props.customer });
    const [loading, set_loading] = useState(false);

    const [errors, set_errors] = useState<string[]>([]);

    const empty_name_error = "customer name must not be empty";
    const name_format_error = "name must not contain / or \\";

    const empty_phone_error = "customer phone number must not be empty";

    const phone_format_error = "phone number must be a number";

    async function update() {
        if (customer.name === "") {
            if (!errors.includes(empty_name_error))
                set_errors([...errors, empty_name_error]);
            return;
        }

        if (customer.phone_number === "") {
            if (!errors.includes(empty_phone_error))
                set_errors([...errors, empty_phone_error]);
            return;
        }

        set_loading(true);
        props.set_loading(true);

        return fetch("/api/app_view/customer", {
            method: Method.PATCH,
            body: JSON.stringify({
                customer: props.customer,
                update: {
                    name: customer.name,
                    phone_number: customer.phone_number,
                    notes: customer.notes,
                },
            }),
        })
            .then(handle_react_query_response(to_customer, props.on_complete))
            .finally(() => {
                set_loading(false);
                props.set_loading(false);
            });
    }

    function on_phone_value_change(phone: string) {
        if (phone !== "") {
            set_errors(errors.filter((e) => e !== empty_phone_error));
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
            if (!errors.includes(phone_format_error)) {
                set_errors([...errors, phone_format_error]);
                set_customer({ ...customer, phone_number: "" });
            }
        } else {
            //todo error on phone digit count
            set_errors(
                errors.filter(
                    (e) => e !== phone_format_error && e !== empty_phone_error,
                ),
            );
            set_customer({
                ...customer,
                phone_number: "1" + num.toString(),
            });
        }
    }

    function on_name_value_change(name: string) {
        if (name !== "") {
            set_errors(errors.filter((e) => e !== empty_name_error));
        } else {
            if (!errors.includes(empty_name_error))
                set_errors([...errors, empty_name_error]);
        }

        if (errors.includes(name_format_error)) {
            set_errors(errors.filter((e) => e !== name_format_error));
        }

        if (name.includes("/") || name.includes("\\")) {
            if (!errors.includes(name_format_error))
                set_errors([...errors, name_format_error]);
        }

        name = name.replaceAll("/", "");
        name = name.replaceAll("\\", "");

        set_customer({ ...customer, name: name });
    }

    return (
        <div className="flex w-full flex-col gap-1">
            <div className="h-fit w-96 border-2 border-black text-black">
                {customer.name}
                <br />
                {format_phone_number(customer.phone_number)}
                <br />
                {customer.notes}
            </div>
            <div className="flex w-full items-center gap-1 p-2">
                <Button
                    className="justify-self-center"
                    color="primary"
                    size="md"
                    isLoading={loading}
                    onPress={update}
                >
                    Update
                </Button>
                <Input
                    label="name"
                    value={customer.name}
                    onValueChange={on_name_value_change}
                />
            </div>
            <div className="flex w-full items-center gap-1 border-b-1 border-t-1 border-b-sky-900 border-t-sky-900 p-2">
                <Input
                    label="phone number"
                    value={format_phone_input(
                        customer.phone_number.substring(1),
                    )}
                    onValueChange={on_phone_value_change}
                />
            </div>
            <div className="flex w-full items-center gap-1 border-b-1 border-t-1 border-b-sky-900 border-t-sky-900 p-2">
                <Input
                    label="notes"
                    value={customer.notes}
                    onValueChange={(notes) => {
                        set_customer({ ...customer, notes: notes });
                    }}
                />
            </div>
            {errors.length !== 0
                ? errors.map((e) => (
                      <div className="w-full text-black">{e}</div>
                  ))
                : null}
        </div>
    );
}
