import { type Location, clear_test_data } from "~/server/db_schema/fb_schema";
import { create_new_location, retrieve_location } from "./location";
import { assign_technician_to_roster, remove_technician_from_roster, retrieve_roster_ids } from "./location_roster";

const test_suit = "location_cruds";

afterAll(async () => {
    await clear_test_data(test_suit);
})

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

test("location roster", async () => {
    const test_name = test_suit.concat("/test_locaton_roster/");

    const location_id = "location_lololllol";
    const tech1_info = {
        id: "Chicken Noodle",
        color: "lolol",
    };
    const tech2_info = {
        id: "Banana Bread hmmmmmm",
        color: "lolanstnol",
    };

    await assign_technician_to_roster({ location_id: location_id, technician: tech1_info }, test_name);
    await assign_technician_to_roster({ location_id: location_id, technician: tech2_info }, test_name);

    const roster: string[] = await retrieve_roster_ids(location_id, test_name);

    expect(roster).toHaveLength(2);
    expect(roster).toContain(tech1_info.id);
    expect(roster).toContain(tech2_info.id);

    await remove_technician_from_roster({ location_id: location_id, technician_id: tech2_info.id }, test_name);

    const post_del_roster: string[] = await retrieve_roster_ids(location_id, test_name);

    expect(post_del_roster).toHaveLength(1);
    expect(post_del_roster).toContain(tech1_info.id);
    expect(post_del_roster).not.toContain(tech2_info.id);
})
