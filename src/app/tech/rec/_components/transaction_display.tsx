import { Technician } from "~/server/technician/type_def";
import { Transaction } from "~/server/transaction/type_def";
import { time_to_string } from "~/util/appointment_time";
import { money } from "~/util/money";

export function TransactionDisplay(props: {
    date: string;
    technician: Technician;
    transactions: Transaction[];
}) {
    const full = "w-60";
    const half = "w-32";

    const shop_entry = {
        amount: 0,
        tip: 0,
    };

    for (let transaction of props.transactions) {
        shop_entry.amount += transaction.amount;
        shop_entry.tip += transaction.tip;
    }

    return (
        <div className="flex w-full flex-1 flex-col overflow-x-auto border-4 border-sky-900">
            <Row
                color="border-b-3 border-b-sky-800 bg-sky-100 text-zinc-950"
                data={[
                    { width: half, text: "Time" },
                    { width: full, text: "Customer Name" },
                    { width: full, text: "Amount (tip)" },
                    { width: full, text: "Detail" },
                ]}
            />

            <div className="flex w-fit flex-1 flex-col justify-start border-4 border-sky-900">
                {props.transactions.map((transaction) => {
                    return (
                        <Row
                            color={transaction.technician.color}
                            data={[
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
                            ]}
                        />
                    );
                })}
                <Row
                    color={props.technician.color}
                    data={[
                        { width: half, text: "" },
                        { width: full, text: "Total:" },
                        {
                            width: full,
                            text:
                                money(shop_entry.amount) +
                                " " +
                                "(" +
                                money(shop_entry.tip) +
                                ")",
                        },
                        { width: full, text: "" },
                    ]}
                />
            </div>
        </div>
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
