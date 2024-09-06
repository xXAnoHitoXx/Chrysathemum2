import { Transaction } from "~/server/db_schema/type_def";
import { time_to_string } from "~/server/validation/semantic/appointment_time";
import { money } from "~/server/validation/semantic/money";

export function TransactionDisplay(props: { transactions: Transaction[] }) {
    const full = "w-60";
    const half = "w-32";

    return (
        <div className="flex w-full flex-1 flex-col overflow-x-auto border-4 border-sky-900">
            <Row
                color="border-b-3 border-b-sky-800 bg-sky-100 text-zinc-950"
                data={[
                    { width: half, text: "Time" },
                    { width: full, text: "Customer Name" },
                    { width: full, text: "Amount (tip)" },
                    { width: half, text: "Detail" },
                    { width: full, text: "Cash Gift Discount" },
                ]}
            />

            <div className="flex w-full flex-1 flex-col overflow-y-auto border-4 border-sky-900">
                {props.transactions.map((transaction) => (
                    <Row
                        color={transaction.technician.color}
                        data={[
                            {
                                width: half,
                                text: time_to_string(transaction.time),
                            },
                            { width: full, text: transaction.customer.name },
                            {
                                width: full,
                                text:
                                    money(transaction.amount) +
                                    " " +
                                    "(" +
                                    money(transaction.tip) +
                                    ")",
                            },
                            { width: half, text: transaction.details },
                            {
                                width: full,
                                text:
                                    money(transaction.cash) +
                                    " " +
                                    money(transaction.gift) +
                                    " " +
                                    money(transaction.discount),
                            },
                        ]}
                    />
                ))}
            </div>
        </div>
    );
}

function Row(props: {
    color: string;
    data: { text: string; width: string }[];
}) {
    return (
        <div className={"flex h-10 w-fit" + " " + props.color}>
            {props.data.map((data) => (
                <div className={data.width + " " + "h-10"}>{data.text}</div>
            ))}
        </div>
    );
}
