import { getLocalTimeZone } from "@internationalized/date";

test("test time zone", async () => {
    console.log(getLocalTimeZone());
    expect(true).toBe(true);
});
