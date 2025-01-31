import { DataError } from "../data_error";
import { z } from "zod";

export function valiDate(date: unknown): string | DataError {
    const context = `Casting {${date}} to Date`;
    let parsed_date = z.string().safeParse(date);
    if (!parsed_date.success) return new DataError(context + " - not a string");

    const split = parsed_date.data.split("-");

    if (split.length != 3)
        return new DataError(context + " - must have 3 fields");

    const year = Number(split[0]);
    const month = Number(split[1]);
    const day = Number(split[2]);

    if (year < 2000 || year > 2100)
        return new DataError(context + " - year out of range (2k - 2.1k)");

    if (month < 1 || month > 12)
        return new DataError(context + " - month not in range (1-12)");

    if (day < 0) return new DataError(context + " - day < 0");

    if (month == 2 && day > 29) return new DataError(context + " - Feb 30+");

    if (month == 4 || month == 6 || month == 9 || month == 11)
        if (day > 30)
            return new DataError(
                context + ` - month {${month}} should only have 30 days`,
            );

    if (day > 31) return new DataError(context + " - have 32+ days");

    return parsed_date.data;
}
