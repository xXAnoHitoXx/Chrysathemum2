import { TaxRate } from "~/constants";
import { Appointment, Transaction } from "~/server/db_schema/type_def";
import { time_to_string } from "~/server/validation/semantic/appointment_time";
import { money } from "~/server/validation/semantic/money";

export function CustomerHistory(props: {
    appointments: Appointment[];
    transactions: Transaction[];
}) {
    const full = "w-60";
    const half = "w-32";

    return (
        <>
            <h1 className="m-3">Appointments</h1>
            <div className="flex h-fit w-fit flex-col border-4 border-sky-900">
                <Row
                    color="border-b-3 border-b-sky-800 bg-sky-100 text-zinc-950"
                    data={[
                        { width: half, text: "Date" },
                        { width: half, text: "Time" },
                        { width: full, text: "Detail" },
                    ]}
                />
                {props.appointments.map((appointment) => {
                    const app_color =
                        appointment.technician == null
                            ? "border-violet-500 text-violet-500 bg-slate-950"
                            : appointment.technician.color;
                    return (
                        <Row
                            color={app_color}
                            data={[
                                { width: half, text: appointment.date },
                                {
                                    width: half,
                                    text: time_to_string(appointment.time),
                                },
                                { width: full, text: appointment.details },
                            ]}
                        />
                    );
                })}
            </div>
            <h1 className="m-3">History</h1>
            <div className="flex h-fit w-fit flex-col border-4 border-sky-900">
                <Row
                    color="border-b-3 border-b-sky-800 bg-sky-100 text-zinc-950"
                    data={[
                        { width: half, text: "Date" },
                        { width: half, text: "Time" },
                        { width: full, text: "Customer Name" },
                        { width: full, text: "Amount (tip)" },
                        { width: full, text: "Detail" },
                        { width: half, text: "Machine" },
                        { width: half, text: "Cash" },
                        { width: half, text: "Gift" },
                        { width: half, text: "Discount" },
                    ]}
                />
                {props.transactions.map((transaction) => (
                    <Row
                        color={transaction.technician.color}
                        data={[
                            {
                                width: half,
                                text: transaction.date,
                            },
                            {
                                width: half,
                                text: time_to_string(transaction.time),
                            },
                            {
                                width: full,
                                text: transaction.customer.name,
                            },
                            {
                                width: full,
                                text:
                                    money(transaction.amount) +
                                    " " +
                                    "(" +
                                    money(transaction.tip) +
                                    ")",
                            },
                            {
                                width: full,
                                text: transaction.details,
                            },
                            {
                                width: half,
                                text: money(
                                    Math.round(transaction.amount * TaxRate) +
                                        transaction.tip -
                                        transaction.cash -
                                        transaction.gift -
                                        transaction.discount,
                                ),
                            },
                            {
                                width: half,
                                text: money(transaction.cash),
                            },
                            {
                                width: half,
                                text: money(transaction.gift),
                            },
                            {
                                width: half,
                                text: money(transaction.discount),
                            },
                        ]}
                    />
                ))}
            </div>
        </>
    );
}

function Row(props: {
    color: string;
    data: { text: string; width: string }[];
}) {
    return (
        <button
            className={
                "flex h-10 w-fit border-b-2 border-r-4 border-t-2" +
                " " +
                props.color
            }
        >
            {props.data.map((data) => (
                <div className={data.width + " " + "h-10"}>{data.text}</div>
            ))}
        </button>
    );
}
