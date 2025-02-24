import { CalendarDate } from "@internationalized/date"
import { getTaxRate } from "./constants";

test("tax rate change april 2025", async () => {
    const date_of = new CalendarDate(2025, 4, 1);
    const date_after = date_of.add({days: 1});
    const date_before = date_of.subtract({days: 1});

    expect(getTaxRate(date_of.toString())).toBe(1.14);
    expect(getTaxRate(date_after.toString())).toBe(1.14);
    expect(getTaxRate(date_before.toString())).toBe(1.15);
})
