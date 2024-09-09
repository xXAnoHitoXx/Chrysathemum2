import { Button, Checkbox, Input } from "@nextui-org/react";
import { useState } from "react";
import { TaxRate } from "~/constants";
import { Transaction } from "~/server/db_schema/type_def";
import { parse_bill } from "../../_components/bill";

export function TransactionUpdate(props: {
    transaction: Transaction;
    on_complete: (transaction: Transaction) => void;
}) {
    const initial_values = { ...props.transaction };
    const [is_loading, set_is_loading] = useState(false);
    const [details, set_details] = useState(props.transaction.details);
    const [discounted, set_discounted] = useState(false);

    function validate_bill(value: string) {
        const data = parse_bill(value);

        if (data.values[0] != undefined) {
            if (discounted)
                props.transaction.amount = Math.floor(data.values[0] / TaxRate);
            else props.transaction.amount = data.values[0];
        } else {
            props.transaction.amount = initial_values.amount;
        }

        if (data.values[1] != undefined) props.transaction.tip = data.values[1];
        else props.transaction.tip = initial_values.tip;

        if (data.note != undefined) {
            const total_cost =
                Math.round(props.transaction.amount * TaxRate) +
                props.transaction.tip;

            switch (data.note) {
                case "c":
                    props.transaction.cash = total_cost;
                    props.transaction.gift = 0;
                    props.transaction.discount = 0;
                case "g":
                    props.transaction.cash = 0;
                    props.transaction.gift = total_cost;
                    props.transaction.discount = 0;
                    break;
                case "m":
                    props.transaction.cash = 0;
                    props.transaction.gift = 0;
                    props.transaction.discount = 0;
                    break;
            }
            return;
        }

        if (data.values[2] != undefined) {
            props.transaction.cash = data.values[2];
        } else {
            props.transaction.cash = initial_values.cash;
        }
        if (data.values[3] != undefined) {
            props.transaction.gift = data.values[3];
        } else {
            props.transaction.gift = initial_values.gift;
        }
        if (data.values[4] != undefined) {
            props.transaction.discount = data.values[4];
        } else {
            props.transaction.discount = initial_values.discount;
        }
    }

    async function close_appointment() {
        set_is_loading(true);
        props.transaction.details = details;
        props.on_complete(props.transaction);
    }

    return (
        <div className="flex w-full flex-col">
            <div className="flex h-fit w-full content-evenly items-center gap-2 p-2">
                <Checkbox
                    isDisabled={is_loading}
                    size="lg"
                    radius="md"
                    color="primary"
                    isSelected={discounted}
                    onValueChange={set_discounted}
                >
                    <div className="text-black">-15%</div>
                </Checkbox>
                <Input
                    isDisabled={is_loading}
                    className="flex-1"
                    label="Bill: amount tip cash gift discount"
                    onValueChange={validate_bill}
                />
            </div>
            <div className="p-2">
                <Input
                    isDisabled={is_loading}
                    className="w-full"
                    label="details"
                    value={details}
                    onValueChange={(det) => {
                        set_details(det);
                    }}
                />
            </div>
            <div className="p- flex w-full flex-row-reverse">
                <Button
                    isLoading={is_loading}
                    color="primary"
                    onClick={close_appointment}
                >
                    Confirm
                </Button>
            </div>
        </div>
    );
}
