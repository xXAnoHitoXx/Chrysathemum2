import { data_error, DataError } from "~/server/data_error";

export function date({ d, m , y }: { d: number, m: number, y: number }): number | DataError {
    const context = "Date Generation";
    if(m > 12) return data_error(context, "month > 12");
    if(d > 31) return data_error(context, "day > 31");
    let date = (y > 2000)? y - 2000 : y;
    date = date * 16;
    date = date + m;
    date = date * 32;
    date = date + d;
    return date;
}

export function date_conversion(old: string): number | DataError {
    const context = "Conversion to new date format error";
    const [d, m, y] = old.split(" ");

    if(d == undefined || m == undefined || y == undefined) {
        return data_error(context, "encountered undefined");
    }

    return date({
        d: Number.parseInt(d),
        m: Number.parseInt(m),
        y: Number.parseInt(y),
    })
}
