import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/react";
import { useState } from "react";
import { Customer } from "~/server/db_schema/type_def";

export function CustomerEdit(props: { cusctomer: Customer }){
    const [customer, set_customer] = useState({...props.cusctomer})

    const [errors, set_errors] = useState<string[]>([]);

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
                >
                    Update
                </Button>
                <Input
                    label="name"
                    value={customer.name}
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
                            props.save.data = customer;
                            props.on_complete(customer);
                        }}
                        className="h-20 w-fit rounded-3xl border-2 border-sky-900 p-3"
                    >
                        {customer.name}
                        <br />
                        {format_phone_number(customer.phone_number)}
                    </button>
                ))}
                {props.save.data == null ? null : (
                    <button
                        onClick={() => {
                            if (props.save.data != null)
                                props.on_complete(props.save.data);
                        }}
                        className="h-20 w-32 rounded-full border-2 border-sky-900 bg-sky-300"
                    >
                        LastCustomer <br />
                        {props.save.data.name}
                        <br />
                        {format_phone_number(props.save.data.name)}
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
