import { is_data_error } from "../data_error";
import { FireDB } from "../fire_db";
import { wipe_test_data } from "../test_util";
import { retrieve_roster } from "./components/roster_entry";
import {
    create_technician_entry,
    delete_technician_entry,
    retrieve_technician_entry,
} from "./components/technician_entry";
import { TechnicianQuery } from "./technician_queries";
import { TechnicianCreationInfo } from "./type_def";

const test_suit = "technician_business_logic";

afterAll(async () => {
    const clean_up = await wipe_test_data.call(
        test_suit,
        FireDB.test(test_suit),
    );

    if (is_data_error(clean_up)) {
        clean_up.log();
    }
});

test("test new technician querry", async () => {
    const test_name = test_suit + "/test_technician_creation_query/";
    const test_db = FireDB.test(test_name);

    const salon = { id: "EKD" };

    const test_input: TechnicianCreationInfo = {
        name: "Tinn",
        color: "Mulalala",
        active_salon: salon.id,
    };

    const technician = await TechnicianQuery.create_new_technician.call(
        test_input,
        test_db,
    );

    if (is_data_error(technician)) {
        technician.log();
        fail();
    }

    // correct imediate return
    expect(technician.name).toBe(test_input.name);
    expect(technician.color).toBe(test_input.color);
    expect(technician.active).toBe(true);

    const created = await retrieve_technician_entry.call(
        { tech_id: technician.id },
        test_db,
    );

    if (is_data_error(created)) {
        created.log();
        fail();
    }

    // correct value stored in database
    expect(created.name).toBe(test_input.name);
    expect(created.color).toBe(test_input.color);
    expect(created.active).toBe(true);

    expect(created).toEqual(technician);

    const roster = await retrieve_roster.call(
        { location_id: salon.id },
        test_db,
    );

    if (is_data_error(roster)) {
        roster.log();
        fail();
    }

    expect(roster.length).toBe(1);
    const entry = roster[0]!;

    if (is_data_error(entry)) {
        entry.log();
        fail();
    }
    expect(entry.technician_id).toBe(technician.id);
    expect(entry.location_id).toBe(salon.id);
    
});

test("test change technician activity querry", async () => {
    const test_name = test_suit + "/test_technician_activity_query/";
    const test_db = FireDB.test(test_name);

    const test_techniclan_data: TechnicianCreationInfo = {
        name: "Tinn",
        color: "Mulalala",
        active_salon: "banana",
    };

    const test_tech = await create_technician_entry.call(
        test_techniclan_data,
        test_db,
    );

    if (is_data_error(test_tech)) {
        test_tech.log();
        fail();
    }

    expect(test_tech.name).toBe(test_techniclan_data.name);
    expect(test_tech.color).toBe(test_techniclan_data.color);
    expect(test_tech.active).toBe(true);

    let db_tech = await retrieve_technician_entry.call(
        { tech_id: test_tech.id },
        test_db,
    );

    if (is_data_error(db_tech)) {
        db_tech.log();
        fail();
    }

    expect(db_tech.name).toBe(test_techniclan_data.name);
    expect(db_tech.color).toBe(test_techniclan_data.color);
    expect(db_tech.active).toBe(true);

    const set_inactive = await TechnicianQuery.mark_inactive.call(
        db_tech,
        test_db,
    );

    if (is_data_error(set_inactive)) {
        set_inactive.log();
        fail();
    }

    db_tech = await retrieve_technician_entry.call(
        { tech_id: test_tech.id },
        test_db,
    );

    if (is_data_error(db_tech)) {
        db_tech.log();
        fail();
    }

    expect(db_tech.name).toBe(test_techniclan_data.name);
    expect(db_tech.color).toBe(test_techniclan_data.color);
    expect(db_tech.active).toBe(false);

    const set_active = await TechnicianQuery.mark_active.call(db_tech, test_db);

    if (is_data_error(set_active)) {
        set_active.log();
        fail();
    }

    db_tech = await retrieve_technician_entry.call(
        { tech_id: test_tech.id },
        test_db,
    );

    if (is_data_error(db_tech)) {
        db_tech.log();
        fail();
    }

    expect(db_tech.name).toBe(test_techniclan_data.name);
    expect(db_tech.color).toBe(test_techniclan_data.color);
    expect(db_tech.active).toBe(true);
});

test("test load all technician querry", async () => {
    const test_name = test_suit + "/test_load_all_technician_query/";
    const test_db = FireDB.test(test_name);

    const technician_1 = {
        name: "banana",
        color: "bruh-nuh-nuh",
        active_salon: "danana",
    };

    const technician_2 = {
        name: "owanges",
        color: "owonges",
        active_salon: "uwunges",
    };

    const t1 = await create_technician_entry.call(technician_1, test_db);
    const t2 = await create_technician_entry.call(technician_2, test_db);

    if (is_data_error(t1) || is_data_error(t2)) {
        fail();
    }

    const v: void = undefined;
    let tech_list = await TechnicianQuery.get_all_technician.call(v, test_db);

    if (is_data_error(tech_list)) {
        tech_list.log();
        fail();
    }

    expect(tech_list).toHaveLength(2);
    expect(tech_list[0]!.name).toBe(technician_1.name);
    expect(tech_list[0]!.color).toBe(technician_1.color);
    expect(tech_list[1]!.name).toBe(technician_2.name);
    expect(tech_list[1]!.color).toBe(technician_2.color);

    const del = await delete_technician_entry.call({ tech_id: t1.id }, test_db);

    if (is_data_error(del)) {
        del.log();
        fail();
    }

    tech_list = await TechnicianQuery.get_all_technician.call(v, test_db);

    if (is_data_error(tech_list)) {
        tech_list.log();
        fail();
    }

    expect(tech_list).toHaveLength(1);
    expect(tech_list[0]!.name).toBe(technician_2.name);
    expect(tech_list[0]!.color).toBe(technician_2.color);
});

test("technician assignment", async () => {
    const test_name = test_suit + "/technician_assignment/";
    const test_db = FireDB.test(test_name);

    const salon = {
        location_id: "5CBL",
    };

    const tech1_info = {
        name: "LOLOLOL",
        color: "aoisetnaoiesrt",
        active_salon: salon.location_id,
    };

    const tech2_info = {
        name: "LOLlastonaOLOL",
        color: "aoisetnaarsetnloiesrt",
        active_salon: salon.location_id,
    };

    const tech3_info = {
        name: "elohel",
        color: "chicken noodle soup",
        active_salon: salon.location_id,
    };

    const tech1 = await TechnicianQuery.create_new_technician.call(
        tech1_info,
        test_db,
    );
    const tech2 = await TechnicianQuery.create_new_technician.call(
        tech2_info,
        test_db,
    );
    const tech3 = await TechnicianQuery.create_new_technician.call(
        tech3_info,
        test_db,
    );

    if (is_data_error(tech1) || is_data_error(tech2) || is_data_error(tech3)) {
        console.log("setup failed");
        fail();
    }

    let location_tech = await TechnicianQuery.get_tech_at_location.call(
        salon,
        test_db,
    );

    if (is_data_error(location_tech)) {
        location_tech.log();
        fail();
    }
    expect(location_tech).toHaveLength(3);
    expect(location_tech).toContainEqual(tech1);
    expect(location_tech).toContainEqual(tech2);
    expect(location_tech).toContainEqual(tech3);

    const remove_tech2 = await TechnicianQuery.unassign_tech_from_location.call(
        {
            location_id: salon.location_id,
            technician_id: tech2.id,
        },
        test_db,
    );

    const remove_tech3 = await TechnicianQuery.unassign_tech_from_location.call(
        {
            location_id: salon.location_id,
            technician_id: tech3.id,
        },
        test_db,
    );

    if (is_data_error(remove_tech2)) {
        remove_tech2.log();
        fail();
    }

    if (is_data_error(remove_tech3)) {
        remove_tech3.log();
        fail();
    }

    location_tech = await TechnicianQuery.get_tech_at_location.call(
        salon,
        test_db,
    );

    if (is_data_error(location_tech)) {
        location_tech.log();
        fail();
    }

    expect(location_tech).toHaveLength(1);
    expect(location_tech).toContainEqual(tech1);
    expect(location_tech).not.toContainEqual(tech2);
    expect(location_tech).not.toContainEqual(tech3);

    const assign_tech3 = await TechnicianQuery.assign_tech_to_location.call(
        {
            location_id: salon.location_id,
            technician_id: tech3.id,
        },
        test_db,
    );

    if (is_data_error(assign_tech3)) {
        assign_tech3.log();
        fail();
    }

    location_tech = await TechnicianQuery.get_tech_at_location.call(
        salon,
        test_db,
    );

    if (is_data_error(location_tech)) {
        location_tech.log();
        fail();
    }

    expect(location_tech).toHaveLength(2);
    expect(location_tech).toContainEqual(tech1);
    expect(location_tech).not.toContainEqual(tech2);
    expect(location_tech).toContainEqual(tech3);
});
