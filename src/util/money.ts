export function money(m: number) {
    let prefix = "$";

    if (m < 0) {
        prefix = "-$";
        m = Math.abs(m);
    }

    const cents = m % 100;
    const dollars = Math.floor(m / 100);
    const cents_string: string = cents < 10 ? "0" + cents : cents.toString();
    return prefix + dollars + "." + cents_string;
}
