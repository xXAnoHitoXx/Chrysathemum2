import { TaxRate } from "~/constants";
import { Technician } from "~/server/technician/type_def";
import { Transaction } from "~/server/transaction/type_def";
import { ano_iter } from "~/util/anoiter/anoiter";
import { time_to_string } from "~/util/appointment_time";
import { money } from "~/util/money";
import { bubble_sort } from "~/util/sorter/ano_bubble_sort";

export function TransactionDisplay(props: {
    transactions: Transaction[];
    on_click: (transaction: Transaction) => void;
}) {
    const full = "w-60";
    const half = "w-32";

    const technicians: Technician[] = [];
    const shop_entry = {
        amount: 0,
        tip: 0,
        machine: 0,
        cash: 0,
        gift: 0,
        discount: 0,
    };

    const record = ano_iter(props.transactions).reduce<
        Record<
            string,
            {
                amount: number;
                tip: number;
                machine: number;
                cash: number;
                gift: number;
                discount: number;
            }
        >
    >((prev, transaction) => {
        const tech_entry = prev[transaction.technician.id];

        if (tech_entry == undefined) {
            technicians.push(transaction.technician);
            prev[transaction.technician.id] = {
                amount: transaction.amount,
                tip: transaction.tip,
                machine:
                    Math.round(transaction.amount * TaxRate) +
                    transaction.tip -
                    transaction.cash -
                    transaction.gift -
                    transaction.discount,
                cash: transaction.cash,
                gift: transaction.tip,
                discount: transaction.discount,
            };
        } else {
            tech_entry.amount += transaction.amount;
            tech_entry.tip += transaction.tip;
            tech_entry.machine +=
                Math.round(transaction.amount * TaxRate) +
                transaction.tip -
                transaction.cash -
                transaction.gift -
                transaction.discount;
            tech_entry.cash += transaction.cash;
            tech_entry.gift += transaction.tip;
            tech_entry.discount += transaction.discount;
        }

        shop_entry.amount += transaction.amount;
        shop_entry.tip += transaction.tip;
        shop_entry.machine +=
            Math.round(transaction.amount * TaxRate) +
            transaction.tip -
            transaction.cash -
            transaction.gift -
            transaction.discount;
        shop_entry.cash += transaction.cash;
        shop_entry.gift += transaction.gift;
        shop_entry.discount += transaction.discount;

        return prev;
    }, {});

    bubble_sort(technicians, (a, b) => b.id.localeCompare(a.id));

    function display_technician(technician: Technician) {
        const entry = record[technician.id];
        if (entry == undefined) return null;

        return (
            <Row
                on_click={() => {}}
                color={technician.color}
                data={[
                    { width: half, text: "" },
                    { width: full, text: technician.name },
                    {
                        width: full,
                        text:
                            money(entry.amount) +
                            " " +
                            "(" +
                            money(entry.tip) +
                            ")",
                    },
                    { width: full, text: "" },
                    {
                        width: half,
                        text: "",
                    },
                    { width: half, text: "" },
                    { width: half, text: "" },
                    {
                        width: half,
                        text: "",
                    },
                ]}
            />
        );
    }

    return (
        <div className="flex h-fit w-full flex-col overflow-x-auto border-4 border-sky-900 bg-white">
            <Row
                on_click={() => {}}
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
                        on_click={() => {}}
                        color="border-b-3 border-b-sky-800 bg-sky-100 text-zinc-950"
                        data={[
                            { width: half, text: "" },
                            { width: full, text: "Shop Total:" },
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
                                    Math.round(shop_entry.amount * TaxRate) +
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
                    {technicians.map(display_technician)}
                    {props.transactions.map((transaction) => {
                        return (
                            <Row
                                on_click={() => {
                                    props.on_click(transaction);
                                }}
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
                                                transaction.amount * TaxRate,
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
    on_click: () => void;
    color: string;
    data: { text: string; width: string }[];
}) {
    return (
        <button
            onClick={props.on_click}
            className={
                "flex h-10 w-fit border-t-2 border-r-4 border-b-2" +
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
