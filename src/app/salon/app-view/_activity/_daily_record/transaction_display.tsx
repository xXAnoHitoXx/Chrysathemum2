import { TaxRate } from "~/constants";
import { Transaction } from "~/server/db_schema/type_def";
import { time_to_string } from "~/server/validation/semantic/appointment_time";
import { money } from "~/server/validation/semantic/money";

export function TransactionDisplay(props: {
    transactions: Transaction[];
    on_click: (transaction: Transaction) => void;
}) {
    const full = "w-60";
    const half = "w-32";

    return (
        <div className="flex w-full flex-1 flex-col overflow-x-auto border-4 border-sky-900">
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

            <div className="flex w-fit flex-1 flex-col overflow-y-auto border-4 border-sky-900">
                {props.transactions.map((transaction) => {
                    console.log(transaction.amount);
                    console.log(transaction.amount * TaxRate);
                    console.log(Math.round(transaction.amount * TaxRate));

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
                                { width: full, text: transaction.details },
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
                                { width: half, text: money(transaction.cash) },
                                { width: half, text: money(transaction.gift) },
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
