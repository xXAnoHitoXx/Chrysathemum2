import { getTaxRate } from "~/constants";
import { TechnicianEarnings } from "~/server/earnings/type_def";
import { money } from "~/util/money";
export function TechAccountDisplay(props: { accounts: TechnicianEarnings[] }) {
    const full = "w-60";
    const half = "w-32";

    if (props.accounts.length === 0) return <div>No Data</div>;

    const to_display: TechnicianEarnings[] = [];
    let tech_total: TechnicianEarnings = {
        date: "Total",
        tech: props.accounts[0]!.tech,
        account: {
            amount: 0,
            tip: 0,
        },
        closing: {
            machine: 0,
            cash: 0,
            gift: 0,
            discount: 0,
        },
    };

    for (const account of props.accounts) {
        tech_total.account.amount += account.account.amount;
        tech_total.account.tip += account.account.tip;
        to_display.push(account);
    }

    to_display.push(tech_total);

    return (
        <div className="flex h-fit w-full flex-wrap bg-white">
            <div className="flex h-fit w-fit flex-col border-4 border-sky-900">
                <Row
                    key="label"
                    color="border-b-3 border-b-sky-800 bg-sky-100 text-zinc-950"
                    data={[
                        { width: half, text: "Date" },
                        { width: full, text: "Amount" },
                        { width: half, text: "tip" },
                        { width: half, text: "tip -Tax" },
                    ]}
                />

                <div className="flex w-fit flex-1 border-t-1 border-sky-900">
                    <div className="flex h-full w-fit flex-col">
                        {to_display.map((account) => {
                            return (
                                <Row
                                    key={account.date + "-" + account.tech.id}
                                    color={account.tech.color}
                                    data={[
                                        {
                                            width: half,
                                            text: account.date,
                                        },
                                        {
                                            width: full,
                                            text: money(account.account.amount),
                                        },
                                        {
                                            width: half,
                                            text: money(account.account.tip),
                                        },
                                        {
                                            width: half,
                                            text: money(
                                                Math.round(
                                                    account.account.tip /
                                                        getTaxRate(
                                                            account.date,
                                                        ),
                                                ),
                                            ),
                                        },
                                    ]}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Row(props: {
    color: string;
    key: string;
    data: { text: string; width: string }[];
}) {
    return (
        <button
            className={
                "flex h-10 w-fit border-b-2 border-r-4 border-t-2" +
                " " +
                props.color
            }
            key={props.key}
        >
            {props.data.map((data) => (
                <div className={data.width + " " + "h-10"}>{data.text}</div>
            ))}
        </button>
    );
}
