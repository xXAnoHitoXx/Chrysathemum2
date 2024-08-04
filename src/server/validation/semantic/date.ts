import { data_error, DataError } from "~/server/data_error";

export function valiDate(date: string): boolean {
    const split = date.split("-");

    if (split.length != 3) return false;

    const day = Number(split[0]);
    const month = Number(split[1]);
    const year = Number(split[2]);

    if (year < 2000 || year > 2100) return false;
    if (month < 1 || month > 12) return false;
    if (month == 2 && day > 29) return false;
    if (month == 4 || month == 6 || month == 9 || month == 11)
        if (day > 30) return false;
    if (day > 31) return false;

    return true;
}

export function date_to_db_string(date: Date) {
    return (
        date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear()
    );
}

export function db_string_to_date(db_date: string): Date | DataError {
    const split = db_date.split("-");

    if (split.length != 3)
        return data_error("convert db_date", `corrupted value {${db_date}}`);

    return new Date(Number(split[2]), Number(split[1]) - 1, Number(split[0]));
}
