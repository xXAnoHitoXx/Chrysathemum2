import { Input } from "@nextui-org/react";
import { useState } from "react";
import {
    Account,
    Appointment,
    type Closing,
} from "~/server/db_schema/type_def";

export function Closing(props: {
    appointment: Appointment;
    on_complete: (info: {
        appointment: Appointment;
        account: Account;
        close: Closing;
    }) => void;
}) {
    const [form, set_form] = useState({
        amount: "0",
        tip: "0",
        cash: "0",
        machine: "0",
        discount: "0",
    });

    return (
        <div className="flex w-full flex-col">
            <div className="flex w-full">
                <Input className="w-1/2" label="Amount" />
                <Input className="w-1/2" label="Tip" />
            </div>
            <div className="flex w-full"></div>
        </div>
    );
}
