export function format_phone_number(phone: string) {
    phone = phone.replaceAll("-", "");
    phone = phone.replaceAll("(", "");
    phone = phone.replaceAll(")", "");

    const p = phone.split("");

    let formated = "";
    for (let i = p.length - 1; i >= 0; i--) {
        const s = p[i];
        if (s != undefined) {
            formated = s + formated;

            if (i != 0) {
                switch (formated.length) {
                    case 4:
                    case 8:
                    case 12:
                        formated = "-" + formated;
                }
            }
        }
    }

    return formated;
}
