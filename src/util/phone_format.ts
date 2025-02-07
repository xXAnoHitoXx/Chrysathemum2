export function format_phone_number(phone: string) {
    phone = phone.replaceAll("-", "");
    phone = phone.replaceAll("(", "");
    phone = phone.replaceAll(")", "");

    const p = phone.split("");

    let formated = "";
    for (let i = 0; i < p.length; i++) {
        const s = p[i];
        if (s != undefined) {
            switch (formated.length) {
                case 1:
                case 5:
                case 9:
                    formated = formated + "-";
            }
            formated = formated + s;
        }
    }

    return formated;
}

export function format_phone_input(phone: string): string {
    phone = phone.replaceAll("-", "");
    phone = phone.replaceAll("(", "");
    phone = phone.replaceAll(")", "");

    const p = phone.split("");

    let formated = "";
    for (let i = 0; i < p.length; i++) {
        const s = p[i];
        if (s != undefined) {
            switch (formated.length) {
                case 3:
                case 7:
                    formated = formated + "-";
            }
            formated = formated + s;
        }
    }

    return formated;
}
