import { CalendarDate, getDayOfWeek, startOfWeek, today } from "@internationalized/date";

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
