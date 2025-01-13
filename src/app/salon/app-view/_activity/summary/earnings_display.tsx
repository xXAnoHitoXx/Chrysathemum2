import { TechAccount } from "~/server/queries/salon/earnings/types";
import { money } from "~/server/validation/semantic/money";
import { bubble_sort } from "~/util/ano_bubble_sort";

export function AccountDisplay(props: { accounts: TechAccount[] }) {
    const full = "w-60";
    const half = "w-32";

    const shop_accounts: {
        date: string;
        account: {
            amount: number;
            tip: number;
        };
        closing: {
            machine: number;
            cash: number;
            gift: number;
            discount: number;
        };
    }[] = [];

    const shop_total = {
        date: "Shop Total",
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

    const to_display: TechAccount[] = [];
    let tech_total: TechAccount = {
        date: "Total",
        tech: {
            id: "none",
            color: "none",
            name: "none",
            active: false,
            login_claimed: undefined,
        },
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
        if (tech_total.tech.id != account.tech.id) {
            to_display.push(tech_total);
            tech_total = {
                date: "Total",
                tech: account.tech,
                account: {
                    amount: account.account.amount,
                    tip: account.account.tip,
                },
                closing: {
                    machine: 0,
                    cash: 0,
                    gift: 0,
                    discount: 0,
                },
            };
        } else {
            tech_total.account.amount += account.account.amount;
            tech_total.account.tip += account.account.tip;
        }

        to_display.push(account);

        shop_total.account.amount += account.account.amount;
        shop_total.account.tip += account.account.tip;

        shop_total.closing.machine += account.closing.machine;
        shop_total.closing.cash += account.closing.cash;
        shop_total.closing.gift += account.closing.gift;
        shop_total.closing.discount += account.closing.discount;

        let found_entry = false;

        for (const shop_account of shop_accounts) {
            if (shop_account.date === account.date) {
                shop_account.account.amount += account.account.amount;
                shop_account.account.tip += account.account.tip;

                shop_account.closing.machine += account.closing.machine;
                shop_account.closing.cash += account.closing.cash;
                shop_account.closing.gift += account.closing.gift;
                shop_account.closing.discount += account.closing.discount;

                found_entry = true;
            }
        }

        if (!found_entry) {
            shop_accounts.push({
                date: account.date,
                account: {
                    amount: account.account.amount,
                    tip: account.account.tip,
                },
                closing: {
                    machine: account.closing.machine,
                    cash: account.closing.cash,
                    gift: account.closing.gift,
                    discount: account.closing.discount,
                },
            });
        }
    }

    to_display.push(tech_total);
    shop_accounts.push(shop_total);

    bubble_sort(shop_accounts, (a, b) => {
        return a.date.localeCompare(b.date);
    });

    return (
        <div className="flex h-fit w-fit flex-wrap">
            <div className="flex h-fit w-fit flex-col border-4 border-sky-900 bg-white">
                <Row
                    key="label"
                    color="border-b-3 border-b-sky-800 bg-sky-100 text-zinc-950"
                    data={[
                        { width: half, text: "Date" },
                        { width: full, text: "Amount (tip)" },
                        { width: half, text: "machine" },
                        { width: half, text: "cash" },
                        { width: half, text: "gift" },
                        { width: half, text: "discount" },
                    ]}
                />

                <div className="flex w-fit flex-1 border-t-1 border-sky-900">
                    <div className="flex h-full w-fit flex-col">
                        {shop_accounts.map((account) => {
                            return (
                                <Row
                                    key={account.date}
                                    color="border-b-3 border-b-sky-800 bg-sky-100 text-zinc-950"
                                    data={[
                                        {
                                            width: half,
                                            text: account.date,
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
                                        {
                                            width: half,
                                            text: money(
                                                account.closing.machine,
                                            ),
                                        },
                                        {
                                            width: half,
                                            text: money(account.closing.cash),
                                        },
                                        {
                                            width: half,
                                            text: money(account.closing.gift),
                                        },
                                        {
                                            width: half,
                                            text: money(
                                                account.closing.discount,
                                            ),
                                        },
                                    ]}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className="flex h-fit w-fit flex-col border-4 border-sky-900 bg-white">
                <Row
                    key="label"
                    color="border-b-3 border-b-sky-800 bg-sky-100 text-zinc-950"
                    data={[
                        { width: half, text: "Date" },
                        { width: full, text: "Technician" },
                        { width: full, text: "Amount (tip)" },
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
