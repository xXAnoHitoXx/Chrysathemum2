import { clear_test_data } from "~/server/db_schema/fb_schema";
import { create_new_location, retrieve_location } from "./location";
import {
    assign_technician_to_roster,
    remove_technician_from_roster,
    retrieve_roster,
} from "./location_roster";
import { pack_test } from "../../server_queries_monad";
import { is_data_error } from "~/server/data_error";

const test_suit = "location_cruds";

afterAll(async () => {
    const res = await clear_test_data(test_suit);
    expect(is_data_error(res)).toBe(false);
});

test("location entry cruds", async () => {
    const test_name = test_suit.concat("/entry_cruds/");

    const location_info = { id: "5CBL", address: "5 Cumberland Dr" };

    const location = await pack_test(location_info, test_name)
        .bind(create_new_location)
        .unpack();
    const location_entry = await pack_test({ id: location_info.id }, test_name)
        .bind(retrieve_location)
        .unpack();

    if (is_data_error(location)) {
        location.log();
        fail();
    }

    if (!is_data_error(location_entry)) {
        expect(location_entry.id).toBe(location_info.id);
        expect(location_entry.address).toBe(location_info.address);
    } else {
        location_entry.log();
        fail();
    }
});

test("location roster", async () => {
    const test_name = test_suit.concat("/test_locaton_roster/");

    const location_id = "location_lololllol";
    const tech1_info = {
        technician_id: "Chicken Noodle",
        color: "lolol",
    };
    const tech2_info = {
        technician_id: "Banana Bread hmmmmmm",
        color: "lolanstnol",
    };

    await pack_test(
        { location_id: location_id, technician: tech1_info },
        test_name,
    )
        .bind(assign_technician_to_roster)
        .unpack();
    await pack_test(
        { location_id: location_id, technician: tech2_info },
        test_name,
    )
        .bind(assign_technician_to_roster)
        .unpack();

    const roster = await pack_test({ location_id: location_id }, test_name)
        .bind(retrieve_roster)
        .unpack();

    if (!is_data_error(roster)) {
        expect(roster).toHaveLength(2);
        expect(roster).toContainEqual(tech1_info);
        expect(roster).toContainEqual(tech2_info);
    } else {
        roster.log();
        fail();
    }

    await pack_test(
        { location_id: location_id, technician_id: tech2_info.technician_id },
        test_name,
    )
        .bind(remove_technician_from_roster)
        .unpack();

    const post_del_roster = await pack_test(
        { location_id: location_id },
        test_name,
    )
        .bind(retrieve_roster)
        .unpack();

    if (!is_data_error(roster)) {
        expect(post_del_roster).toHaveLength(1);
        expect(post_del_roster).toContainEqual(tech1_info);
        expect(post_del_roster).not.toContainEqual(tech2_info);
    } else {
        roster.log();
        fail();
    }
});
