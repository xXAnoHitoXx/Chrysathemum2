import { data_error, DataError } from "~/server/data_error";

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
