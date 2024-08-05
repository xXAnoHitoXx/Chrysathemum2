import { data_error, DataError } from "~/server/data_error";
import { is_string } from "../simple_type";

export function valiDate(date: unknown): string | DataError {
    const context = "Casting to Date";
    if (!is_string(date)) return data_error(context, "not a string");

    const split = date.split("-");

    if (split.length != 3) return data_error(context, "must have 3 fields");

    const day = Number(split[0]);
    const month = Number(split[1]);
    const year = Number(split[2]);

    if (year < 2000 || year > 2100)
        return data_error(context, "year out of range (2k - 2.1k)");

    if (month < 1 || month > 12)
        return data_error(context, "month not in range (1-12)");

    if (day < 0) return data_error(context, "day < 0");

    if (month == 2 && day > 29) return data_error(context, "Feb 30+");

    if (month == 4 || month == 6 || month == 9 || month == 11)
        if (day > 30)
            return data_error(
                context,
                `month {${month}} should only have 30 days`,
            );

    if (day > 31) return data_error(context, "have 32+ days");

    return date;
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
