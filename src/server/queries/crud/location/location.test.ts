import { type Location, clear_test_data } from "~/server/db_schema/fb_schema";
import { create_new_location, retrieve_location } from "./location";

const test_suit = "location_cruds";

afterAll(async () => {
    await clear_test_data(test_suit);
})

// export async function create_new_technician(
test("location entry cruds", async () => {
    const test_name = test_suit.concat("/entry_cruds/");

    const location_info = { id: "5CBL", address: "5 Cumberland Dr" };

    const location: Location = await create_new_location(location_info, test_name);
    const location_entry: Location | null = await retrieve_location({ id: location_info.id }, test_name);

    expect(location_entry).not.toBeNull();
    if(location_entry != null){
        expect(location_entry.id).toBe(location.id);
        expect(location_entry.address).toBe(location.address);
    }

    expect(location.id).toBe(location_info.id);
    expect(location.address).toBe(location_info.address);
})
