import { CalendarDate, getLocalTimeZone, startOfWeek } from "@internationalized/date";

test("test time zone", async () => {
    console.log(getLocalTimeZone());
    expect(true).toBe(true);
});

test("start of week", async () => {
    const known_sunday = new CalendarDate(2025, 1, 12);
    expect(startOfWeek(known_sunday, "en-US").compare(known_sunday)).toBe(0);
});
