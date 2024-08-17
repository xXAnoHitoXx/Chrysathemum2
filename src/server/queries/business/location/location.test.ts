import { clear_test_data } from "~/server/db_schema/fb_schema";
import { create_new_location } from "~/server/queries/crud/location/location";
import {
    assign_technician_to_location,
    remove_technician_from_location,
    retrieve_technicians_at_location,
} from "./location";
import { retrieve_technician_entry } from "~/server/queries/crud/technician/technician_entry";
import { pack_test } from "../../server_queries_monad";
import { create_technician_entry } from "../../crud/technician/technician_entry";
import { is_data_error } from "~/server/data_error";

const test_suit = "location_business_queries";

afterAll(async () => {
    await clear_test_data(test_suit);
});

test("technician assignment", async () => {
    const test_name = test_suit.concat("/technician_assignment/");

    const salon = {
        id: "5CBL",
        address: "5 Cumberland",
    };

    const tech1_info = {
        name: "LOLOLOL",
        color: "aoisetnaoiesrt",
        active: true,
    };

    const tech2_info = {
        name: "LOLlastonaOLOL",
        color: "aoisetnaarsetnloiesrt",
        active: false,
    };

    const tech3_info = {
        name: "elohel",
        color: "chicken noodle soup",
        active: false,
    };

    const location_test = await pack_test(salon, test_name)
        .bind(create_new_location)
        .unpack();
    const tech1 = await pack_test(tech1_info, test_name)
        .bind(create_technician_entry)
        .unpack();
    const tech2 = await pack_test(tech2_info, test_name)
        .bind(create_technician_entry)
        .unpack();
    const tech3 = await pack_test(tech3_info, test_name)
        .bind(create_technician_entry)
        .unpack();

    if (
        is_data_error(location_test) ||
        is_data_error(tech1) ||
        is_data_error(tech2) ||
        is_data_error(tech3)
    ) {
        console.log("setup failed");
        fail();
    }

    const q1 = await pack_test(
        { location_id: salon.id, technician: tech1 },
        test_name,
    )
        .bind(assign_technician_to_location)
        .unpack();
    const q2 = await pack_test(
        { location_id: salon.id, technician: tech2 },
        test_name,
    )
        .bind(assign_technician_to_location)
        .unpack();

    if (is_data_error(q1) || is_data_error(q2)) {
        console.log("setup failed");
        fail();
    }

    const technician1 = await pack_test({ id: tech1.id }, test_name)
        .bind(retrieve_technician_entry)
        .unpack();
    const technician2 = await pack_test({ id: tech2.id }, test_name)
        .bind(retrieve_technician_entry)
        .unpack();
    const technician3 = await pack_test({ id: tech3.id }, test_name)
        .bind(retrieve_technician_entry)
        .unpack();

    if (
        is_data_error(technician2) ||
        is_data_error(technician1) ||
        is_data_error(technician3)
    ) {
        console.log("setup failed");
        fail();
    }

    expect(technician1.active).toBe(true);
    expect(technician2.active).toBe(true);
    expect(technician3.active).toBe(false);

    let technicians = await pack_test({ location_id: salon.id }, test_name)
        .bind(retrieve_technicians_at_location)
        .unpack();

    if (is_data_error(technicians)) {
        technicians.log();
        fail();
    }

    if (technicians.error != null) {
        technicians.error.log();
        fail();
    }

    expect(technicians.data).toHaveLength(2);
    expect(technicians.data).toContainEqual(technician1);
    expect(technicians.data).toContainEqual(technician2);
    expect(technicians.data).not.toContainEqual(technician3);

    const removal = await pack_test(
        { location_id: salon.id, technician_id: technician2.id },
        test_name,
    )
        .bind(remove_technician_from_location)
        .unpack();
    if (is_data_error(removal)) {
        removal.log();
        fail();
    }

    technicians = await pack_test({ location_id: salon.id }, test_name)
        .bind(retrieve_technicians_at_location)
        .unpack();

    if (is_data_error(technicians)) {
        technicians.log();
        fail();
    }

    if (technicians.error != null) {
        technicians.error.log();
        fail();
    }

    expect(technicians.data).toHaveLength(1);
    expect(technicians.data).toContainEqual(technician1);
    expect(technicians.data).not.toContainEqual(technician2);
    expect(technicians.data).not.toContainEqual(technician3);
});

/*
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
*/
