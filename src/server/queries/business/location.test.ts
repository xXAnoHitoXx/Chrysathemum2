import { type Location, clear_test_data } from "~/server/db_schema/fb_schema";
import { create_new_location } from "../crud/location/location";
import { get_location_list } from "./location";

const test_suit = "location_business_queries";

afterAll(async () => {
    await clear_test_data(test_suit);
})

test("location list", async () => {
    const test_name = test_suit.concat("/retrieve_location_list/");

    const salon1 = {
        id: "5CBL",
        address: "5 Cumberland Dr"
    }
    const salon2 = {
        id: "6BNA",
        address: "6 Banana Ln"
    }

    await create_new_location(salon1, test_name);
    await create_new_location(salon2, test_name);

    const list: Location[] = await get_location_list(test_name);

    expect(list).toHaveLength(2);

    const ids: string[] = list.map((location) => (location.id));
    expect(ids).toContain(salon1.id);
    expect(ids).toContain(salon2.id);
})
