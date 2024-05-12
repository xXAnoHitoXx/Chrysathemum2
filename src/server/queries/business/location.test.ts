import { clear_test_data } from "~/server/db_schema/fb_schema";
import type { Technician, Location } from "~/server/db_schema/type_def";
import { create_new_location } from "../crud/location/location";
import { assign_technician_to_location, get_location_list, retrieve_technicians_at } from "./location";
import { retrieve_roster_ids } from "../crud/location/location_roster";
import { izip } from "itertools"
import { create_new_technician, mark_technician_inactive } from "./technician_queries";
import { retrieve_technician_entry } from "../crud/technician/technician_entry";

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

test("technician assignment", async () => {
    const test_name = test_suit.concat("/technician_assignment/");

    const salon = {
        id: "5CBL",
        address: "5 Cumberland"
    }

    const tech1_info = {
        name: "LOLOLOL",
        color: "aoisetnaoiesrt",
    }

    const tech2_info = {
        name: "LOLlastonaOLOL",
        color: "aoisetnaarsetnloiesrt",
    }

    await create_new_location(salon, test_name);
    const tech1 = await create_new_technician(tech1_info, test_name);
    const tech2 = await create_new_technician(tech2_info, test_name);
    await mark_technician_inactive(tech2, test_name);

    expect(tech1.active).toBe(true);
    expect(tech2.active).toBe(false);

    await assign_technician_to_location({location_id: salon.id, technician: tech1}, test_name);
    await assign_technician_to_location({location_id: salon.id, technician: tech2}, test_name);

    expect((await retrieve_technician_entry(tech2.id, test_name))?.active).toBe(true);

    expect(tech1.active).toBe(true);
    expect(tech2.active).toBe(true);
    
    const roster: string[] = await retrieve_roster_ids(salon.id, test_name);
    const techs: Technician[] = await retrieve_technicians_at(salon.id, test_name);

    expect(roster).toHaveLength(2);
    expect(techs).toHaveLength(2);
    expect(roster).toContain(tech1.id);
    expect(roster).toContain(tech2.id);

    expect(roster.length).toBe(techs.length);
    for (const [roster_id, tech] of izip(roster,techs)) {
        expect(tech.id).toBe(roster_id);
    }
})
