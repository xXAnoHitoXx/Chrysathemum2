import { Checkbox, Input } from "@heroui/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { parse_bill } from "~/app/salon/app-view/_components/bill";
import { NoTechColor, TaxRate } from "~/constants";
import { Appointment } from "~/server/appointment/type_def";
import { AppointmentClosingData } from "~/server/transaction/type_def";
import { format_phone_number } from "~/util/phone_format";

export function ClosingForm(props: {
    appointment: Appointment;
    set_closing_data: Dispatch<SetStateAction<AppointmentClosingData | null>>;
    on_change: () => void;
}) {
    const [details, set_details] = useState(props.appointment.details);
    const [input, set_input] = useState("");
    const [discounted, set_discounted] = useState(false);

    useEffect(() => {
        const bill = parse_bill(input);

        if (bill.values[0] == undefined || bill.values[1] == undefined) {
            props.set_closing_data(() => null);
            return;
        }

        const closing_data: number[] = [];

        closing_data.push(
            discounted ? Math.round(bill.values[0] / TaxRate) : bill.values[0],
        );

        closing_data.push(bill.values[1]);

        if (bill.note != undefined) {
            const total = discounted
                ? bill.values[0] + bill.values[1]
                : Math.round(bill.values[0] * TaxRate) + bill.values[1];
            switch (bill.note) {
                case "g":
                    closing_data.push(0);
                case "c":
                    closing_data.push(total);
            }
        } else {
            let i = 2;
            let v = bill.values[i];
            while (v != undefined) {
                closing_data.push(v);
                i++;
                v = bill.values[i];
            }
        }

        let amount: number =
            closing_data[0] === undefined ? 0 : closing_data[0];

        if (discounted) {
            amount = Math.round(amount / TaxRate);
        }

        const tip = closing_data[1] == undefined ? 0 : closing_data[1];
        const cash = closing_data[2] == undefined ? 0 : closing_data[2];
        const gift = closing_data[3] == undefined ? 0 : closing_data[3];
        const discount = closing_data[4] == undefined ? 0 : closing_data[4];

        props.set_closing_data({
            appointment: props.appointment,
            account: {
                amount: amount,
                tip: tip,
            },
            closing: {
                cash: cash,
                gift: gift,
                discount: discount,
                machine:
                    Math.round(amount * TaxRate) + tip - cash - gift - discount,
            },
        });
    }, [discounted, input]);

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
                    size="lg"
                    radius="md"
                    color="primary"
                    isSelected={discounted}
                    onValueChange={set_discounted}
                >
                    <div className="text-black">-15%</div>
                </Checkbox>
                <Input
                    className="flex-1"
                    label="Bill: amount tip cash gift discount"
                    onValueChange={set_input}
                />
            </div>
            <div className="p-2">
                <Input
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
        </div>
    );
}
