import { clear_test_data } from "~/server/db_schema/fb_schema";
import type { Technician } from "~/server/db_schema/type_def";
import { create_new_location } from "~/server/queries/crud/location/location";
import { assign_technician_to_location } from "./location";
import { retrieve_technician_entry } from "~/server/queries/crud/technician/technician_entry";
import { QueryError, is_successful_query, pack_test } from "../../server_queries_monad";
import { create_technician_entry } from "../../crud/technician/technician_entry";
import { is_server_error } from "~/server/server_error";
import { retrieve_roster } from "../../crud/location/location_roster";

const test_suit = "location_business_queries";

afterAll(async () => {
    await clear_test_data(test_suit);
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
        active: true,
    }

    const tech2_info = {
        name: "LOLlastonaOLOL",
        color: "aoisetnaarsetnloiesrt",
        active: false,
    }

    const location_test = await pack_test(salon, test_name)
        .bind(create_new_location)
        .unpack();
    const tech1 = await pack_test(tech1_info, test_name)
        .bind(create_technician_entry)
        .unpack()
    const tech2 = await pack_test(tech2_info, test_name)
        .bind(create_technician_entry)
        .unpack()
    
    if(
        is_server_error(location_test) ||
        is_server_error(tech1) ||
        is_server_error(tech2)
    ) {
        fail();
    }

    const q1 = await pack_test({ location_id: salon.id, technician: tech1 }, test_name)
        .packed_bind(assign_technician_to_location)
        .unpack();
    const q2 = await pack_test({ location_id: salon.id, technician: tech2 }, test_name)
        .packed_bind(assign_technician_to_location)
        .unpack();

    if(
        is_server_error(q1) ||
        is_server_error(q2)
    ) {
        fail()
    }

    const technician1: Technician | QueryError = await pack_test({ id: tech1.id }, test_name)
        .bind(retrieve_technician_entry)
        .unpack();
    const technician2: Technician | QueryError = await pack_test({ id: tech2.id }, test_name)
        .bind(retrieve_technician_entry)
        .unpack();
    
    if(is_successful_query(technician2) && is_successful_query(technician1)) {
        expect(technician2.active).toBe(true)
    } else {
        fail();
    }

    const roster = await pack_test({ location_id: salon.id }, test_name)
        .bind(retrieve_roster)
        .unpack();

    if(is_successful_query(roster)) {
        expect(roster).toHaveLength(2);
        expect(roster).toContainEqual({ technician_id: tech1.id, color: tech1.color });
        expect(roster).toContainEqual({ technician_id: tech2.id, color: tech2.color });
    } else {
        fail();
    }
})
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
*/
