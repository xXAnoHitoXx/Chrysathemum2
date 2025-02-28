import { is_data_error } from "~/server/data_error";
import { FireDB } from "~/server/fire_db";
import { wipe_test_data } from "~/server/test_util";
import {
    create_technician_entry,
    delete_technician_entry,
    retrieve_technician_entry,
    update_technician_entry,
} from "./technician_entry";
import { Technician } from "../type_def";
import {
    create_roster_entry,
    delete_roster_entry,
    retrieve_roster,
    RosterEntry,
} from "./roster_entry";

const test_suit = "technician_cruds";

afterAll(async () => {
    const clean_up = await wipe_test_data.call(
        test_suit,
        FireDB.test(test_suit),
    );

    if (is_data_error(clean_up)) {
        clean_up.log();
    }
});

test("test technician entries CRUD queries", async () => {
    const test_name = test_suit + "/test_customer_entries_cruds/";
    const test_db = FireDB.test(test_name);

    const test_technician_entry = await create_technician_entry.call(
        { name: "Tinn", color: "blu", active_salon: "banana" },
        test_db,
    );

    if (is_data_error(test_technician_entry)) {
        test_technician_entry.log();
        fail();
    }

    const created_technician_entry = await retrieve_technician_entry.call(
        { tech_id: test_technician_entry.id },
        test_db,
    );

    if (is_data_error(created_technician_entry)) {
        created_technician_entry.log();
        fail();
    }

    expect(created_technician_entry).toEqual(test_technician_entry);

    const update_target: Technician = {
        id: test_technician_entry.id,
        name: "chicken",
        color: "yolo",
        active: true,
        login_claimed: undefined,
    };

    await update_technician_entry.call(update_target, test_db);

    const updated_technician_entry = await retrieve_technician_entry.call(
        { tech_id: test_technician_entry.id },
        test_db,
    );

    if (is_data_error(updated_technician_entry)) {
        updated_technician_entry.log();
        fail();
    }

    expect(updated_technician_entry).toEqual(update_target);

    await delete_technician_entry.call(
        { tech_id: test_technician_entry.id },
        test_db,
    );

    const no_technician_entry = await retrieve_technician_entry.call(
        { tech_id: test_technician_entry.id },
        test_db,
    );

    expect(is_data_error(no_technician_entry)).toBe(true);
});

test("location roster", async () => {
    const test_name = test_suit + "/test_locaton_roster/";
    const test_db = FireDB.test(test_name);

    const location_id = "location_lololllol";

    const tech1: RosterEntry = {
        location_id: location_id,
        technician_id: "Chicken Noodle",
    };
    const tech2: RosterEntry = {
        location_id: location_id,
        technician_id: "Banana Bread hmmmmmm",
    };

    await create_roster_entry.call(tech1, test_db);

    await create_roster_entry.call(tech2, test_db);

    const roster = await retrieve_roster.call(
        { location_id: location_id },
        test_db,
    );

    if (is_data_error(roster)) {
        roster.log();
        fail();
    }

    expect(roster).toHaveLength(2);
    expect(roster).toContainEqual(tech1);
    expect(roster).toContainEqual(tech2);

    await delete_roster_entry.call(tech2, test_db);

    const post_del_roster = await retrieve_roster.call(
        { location_id: location_id },
        test_db,
    );

    if (is_data_error(roster)) {
        roster.log();
        fail();
    }

    expect(post_del_roster).toHaveLength(1);
    expect(post_del_roster).toContainEqual(tech1);
    expect(post_del_roster).not.toContainEqual(tech2);
});
