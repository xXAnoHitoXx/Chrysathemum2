import { getTaxRate } from "~/constants";
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
        machine: 0,
        cash: 0,
        gift: 0,
        discount: 0,
    };

    for (let transaction of props.transactions) {
        shop_entry.amount += transaction.amount;
        shop_entry.tip += transaction.tip;
        shop_entry.machine +=
            Math.round(transaction.amount * getTaxRate(transaction.date)) +
            transaction.tip -
            transaction.cash -
            transaction.gift -
            transaction.discount;
        shop_entry.cash += transaction.cash;
        shop_entry.gift += transaction.gift;
        shop_entry.discount += transaction.discount;
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
                    { width: half, text: "Machine" },
                    { width: half, text: "Cash" },
                    { width: half, text: "Gift" },
                    { width: half, text: "Discount" },
                ]}
            />

            <div className="flex w-fit flex-1 border-4 border-sky-900">
                <div className="flex h-full w-fit flex-col-reverse">
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
                            {
                                width: half,
                                text: money(
                                    Math.round(
                                        shop_entry.amount *
                                            getTaxRate(props.date),
                                    ) +
                                        shop_entry.tip -
                                        shop_entry.cash -
                                        shop_entry.gift -
                                        shop_entry.discount,
                                ),
                            },
                            { width: half, text: money(shop_entry.cash) },
                            { width: half, text: money(shop_entry.gift) },
                            {
                                width: half,
                                text: money(shop_entry.discount),
                            },
                        ]}
                    />
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
                                    {
                                        width: half,
                                        text: money(
                                            Math.round(
                                                transaction.amount *
                                                    getTaxRate(
                                                        transaction.date,
                                                    ),
                                            ) +
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
                        );
                    })}
                </div>
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
