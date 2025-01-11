import { TechAccount } from "~/server/queries/earnings/types";
import { money } from "~/server/validation/semantic/money";

export function AccountDisplay(props: {
    accounts: TechAccount[];
}) {
    const full = "w-60";
    const half = "w-32";

    const to_display: TechAccount[] = [];
    const shop: TechAccount = {
        date: "",
        tech: {
            id: "shop",
            name: "Shop Total:",
            color: "border-b-3 border-b-sky-800 bg-sky-100 text-zinc-950",
            login_claimed: undefined,
            active: true,
        },
        account: {
            amount: 0,
            tip: 0,
        }
    }
    let tech_total: TechAccount = shop;

    for (const account of props.accounts) {
        if (tech_total.tech.id != account.tech.id) {
            to_display.push(tech_total);
            tech_total = {
                date: "",
                tech: account.tech,
                account: {
                    amount: account.account.amount,
                    tip: account.account.tip,
                }
            }
        } else {
            tech_total.account.amount += account.account.amount;
            tech_total.account.tip += account.account.tip;
        }

        to_display.push(account);
    }

    return (
        <div className="flex w-full h-fit flex-col overflow-x-auto border-4 border-sky-900">
            <Row
                color="border-b-3 border-b-sky-800 bg-sky-100 text-zinc-950"
                data={[
                    { width: full, text: "Date" },
                    { width: full, text: "Technician" },
                    { width: full, text: "Amount (tip)" },
                ]}
            />

            <div className="flex w-fit flex-1 border-4 border-sky-900">
                <div className="flex h-full w-fit flex-col-reverse">
                    {to_display.map((account) => {
                        return (
                            <Row
                                color={account.tech.color}
                                data={[
                                    {
                                        width: half,
                                        text: account.date,
                                    },
                                    {
                                        width: full,
                                        text: account.tech.name,
                                    },
                                    {
                                        width: full,
                                        text:
                                            money(account.account.amount) +
                                            " " +
                                            "(" +
                                            money(account.account.tip) +
                                            ")",
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
