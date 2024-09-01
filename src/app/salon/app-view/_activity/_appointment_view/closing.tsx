import { Button, Checkbox, Input } from "@nextui-org/react";
import { useState } from "react";
import { NoTechColor, TaxRate } from "~/constants";
import {
    Account,
    Appointment,
    Closing as Close,
} from "~/server/db_schema/type_def";
import { format_phone_number } from "~/server/validation/semantic/phone_format";

export function Closing(props: {
    appointment: Appointment;
    on_close: (data: {
        appointment: Appointment;
        close: Close;
        account: Account;
    }) => void;
    on_update: (appointment: Appointment) => void;
    on_change: () => void;
}) {
    const [is_loading, set_is_loading] = useState(false);
    const [is_bill_valid, set_is_bill_valid] = useState(true);
    const [details, set_details] = useState(props.appointment.details);
    const [discounted, set_discounted] = useState(false);
    const [closing_data, set_closing_data] = useState<number[]>([]);

    function validate_bill(value: string) {
        const vals = value.replaceAll(".", "").split(" ");

        if (vals.length < 2) {
            set_is_bill_valid(false);
            return;
        }

        const data: number[] = [];
        for (let i = 0; i < vals.length; i++) {
            const n = Number(vals[i]);
            if (isNaN(n) || !Number.isInteger(n)) {
                set_is_bill_valid(false);
                return;
            }
            data.push(n);
        }

        set_closing_data(data);
        set_is_bill_valid(true);
    }

    async function close_appointment() {
        set_is_loading(true);

        if (is_bill_valid) {
            let amount: number =
                closing_data[0] == undefined ? 0 : closing_data[0];

            if (discounted) {
                amount = Math.round(amount / TaxRate);
            }

            const tip = closing_data[1] == undefined ? 0 : closing_data[1];
            const cash = closing_data[2] == undefined ? 0 : closing_data[2];
            const gift = closing_data[3] == undefined ? 0 : closing_data[3];
            const discount = closing_data[4] == undefined ? 0 : closing_data[4];

            props.on_close({
                appointment: props.appointment,
                account: {
                    amount: amount,
                    tip: tip,
                },
                close: {
                    cash: cash,
                    gift: gift,
                    discount: discount,
                    machine: amount * TaxRate + tip - cash - gift - discount,
                },
            });
        } else {
            props.on_update(props.appointment);
        }
    }

    const app_color =
        props.appointment.technician == null
            ? NoTechColor
            : props.appointment.technician.color;

    return (
        <div className="flex w-full flex-col">
            <div className="flex h-fit w-full content-evenly items-center gap-2 p-2">
                <div className="grid h-full w-1/4 grid-cols-1 justify-items-center">
                    <button
                        className={"w-full border-2".concat(
                            " ",
                            app_color,
                            " ",
                            "m-1 rounded",
                        )}
                    >
                        {props.appointment.customer.name}
                        <br />
                        {format_phone_number(
                            props.appointment.customer.phone_number,
                        )}
                        <br />
                        {props.appointment.technician == null
                            ? null
                            : props.appointment.technician.name +
                              " " +
                              "-" +
                              " "}
                        {details}
                    </button>
                </div>
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
                    label="Bill"
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
                        props.appointment.details = det;
                        set_details(det);
                        props.on_change();
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
