import { CalendarDate } from "@internationalized/date";

export function getTaxRate(date: string) {
    const april_1st_25 = new CalendarDate(2025, 4, 1).toString();

    if(date.localeCompare(april_1st_25) >= 0) {
        return 1.14;
    }

    return 1.15;
}

export function getTaxPercent(date: string) {
    const april_1st_25 = new CalendarDate(2025, 4, 1).toString();

    if(date.localeCompare(april_1st_25) >= 0) {
        return "14%";
    }

    return "15%";
}

export const NoTechColor = "border-violet-500 text-violet-500 bg-slate-950";
