import { Button, Checkbox, Input } from "@heroui/react";
import { useState } from "react";
import { TaxRate } from "~/constants";
import { parse_bill } from "../../_components/bill";
import { Transaction } from "~/server/transaction/type_def";

export function TransactionUpdate(props: {
    transaction: Transaction;
    on_complete: (transaction: Transaction) => void;
}) {
    const [is_loading, set_is_loading] = useState(false);
    const [details, set_details] = useState(props.transaction.details);
    const [discounted, set_discounted] = useState(false);

    function validate_bill(value: string) {
        const bill = parse_bill(value);

        if (bill.values[0] == undefined || bill.values[1] == undefined) {
            return;
        }

        const amount: number = discounted? Math.round(bill.values[0] / TaxRate) : bill.values[0];
        const tip: number = bill.values[1];

        let cash = 0;
        let gift = 0;
        let discount = 0;

        if (bill.note != undefined) {
            const total = discounted
                ? bill.values[0] + bill.values[1]
                : Math.round(bill.values[0] * TaxRate) + bill.values[1];
            switch (bill.note) {
                case "g":
                    gift = total;
                    break;
                case "c":
                    cash = total;
                    break;
            }
        } else {
            let v = bill.values[2];
            if (v != undefined) {
                cash = v;
            }
            v = bill.values[3];
            if (v != undefined) {
                gift = v;
            }
            v = bill.values[4];
            if (v != undefined) {
                discount = v;
            }
        }

        props.transaction.amount = amount;
        props.transaction.tip = tip;
        props.transaction.cash = cash;
        props.transaction.gift = gift;
        props.transaction.discount = discount;
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
                    onPress={close_appointment}
                >
                    Confirm
                </Button>
            </div>
        </div>
    );
}
