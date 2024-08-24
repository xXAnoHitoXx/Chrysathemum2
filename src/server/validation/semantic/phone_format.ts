export function format_phone_number(phone: string) {
    const p = phone.split("");
    if (p.length != 11) return phone;
    return (
        p[0] +
        "-" +
        p[1] +
        p[2] +
        p[3] +
        "-" +
        p[4] +
        p[5] +
        p[6] +
        "-" +
        p[7] +
        p[8] +
        p[9] +
        p[10]
    );
}
