export type Bill = {
    values: (number | undefined)[];
    note: string | undefined;
};

export function parse_bill(bill: string): Bill {
    const vals = bill.replaceAll(".", "").split(" ");

    const data: (number | undefined)[] = [];
    for (let i = 0; i < vals.length; i++) {
        const v = vals[i];

        if (v === "c" || v === "g" || v === "m") {
            return {
                values: data,
                note: v,
            };
        }

        const n = Number(v);
        if (v === "" || isNaN(n) || !Number.isInteger(n)) {
            data.push(undefined);
        } else {
            data.push(n);
        }
    }

    return {
        values: data,
        note: undefined,
    };
}
