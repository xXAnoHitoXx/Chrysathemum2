export function money(m: number) {
    const cents = m % 100;
    const dollars = Math.floor(m / 100);
    const cents_string: string = cents < 10 ? "0" + cents : cents.toString();
    return "$" + dollars + "." + cents_string;
}
