import {
    CalendarDate,
    getDayOfWeek,
    startOfWeek,
    today,
} from "@internationalized/date";
import { is_string } from "../simple_type";
import { data_error, DataError } from "~/server/data_error";

const Chrysanthemum_Time_Zone = "America/Halifax";

export function current_date() {
    return today(Chrysanthemum_Time_Zone);
}

export function last_sunday() {
    const tday: CalendarDate = today(Chrysanthemum_Time_Zone);
    if (getDayOfWeek(tday, "en-US") != 0) {
        return startOfWeek(tday, "en-US");
    }

    return tday.subtract({ weeks: 1 });
}

export function last_monday() {
    const tday: CalendarDate = today(Chrysanthemum_Time_Zone);
    if (getDayOfWeek(tday, "en-US") != 1) {
        return last_sunday().add({ days: 1 });
    }

    return tday.subtract({ weeks: 1 });
}

export function valiDate(date: unknown): string | DataError {
    const context = `Casting {${date}} to Date`;
    if (!is_string(date)) return data_error(context, "not a string");

    const split = date.split("-");

    if (split.length != 3) return data_error(context, "must have 3 fields");

    const year = Number(split[0]);
    const month = Number(split[1]);
    const day = Number(split[2]);

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
