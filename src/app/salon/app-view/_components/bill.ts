export type Bill = {
    values: (number | undefined)[];
    note: string | undefined;
};

export function parse_bill(bill: string): Bill {
    const vals = bill.replaceAll(".", "").split(" ");

    if (vals.length < 2) {
        return {
            values: [undefined, undefined],
            note: undefined,
        };
    }

    const data: (number | undefined)[] = [];
    for (let i = 0; i < vals.length; i++) {
        const v = vals[i];

        if (i === 2 && (v === "c" || v === "C" || v === "g" || v === "G")) {
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
