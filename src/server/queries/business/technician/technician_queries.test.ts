import { clear_test_data } from "~/server/db_schema/fb_schema";
import { create_new_technician, get_all_technicians, mark_technician_active, mark_technician_inactive } from "./technician_queries";
import { QueryError, is_successful_query, pack_test } from "../../server_queries_monad";
import { create_technician_entry, delete_technician_entry, retrieve_technician_entry } from "../../crud/technician/technician_entry";
import { Location, Technician } from "~/server/db_schema/type_def";
import { is_server_error } from "~/server/server_error";
import { create_new_location } from "../../crud/location/location";
import { TechnicianCreationInfo } from "~/app/api/technician/create/validation";
import { retrieve_roster } from "../../crud/location/location_roster";

const test_suit = "technician_business_logic";

afterAll(async () => {
    await clear_test_data(test_suit);
})

test("test new technician querry", async () => {
    const test_name = test_suit.concat("/test_technician_creation_query/");

    const salon: Location = {
        id: "EKD",
        address: "Earth Kingdom"
    }

    const test_input: TechnicianCreationInfo = {
        name: "Tinn",
        color: "Mulalala",
        active_salon: salon.id,
    }

    const location_query = await pack_test(salon, test_name).bind(create_new_location).unpack();
    if(is_server_error(location_query)) { fail(); }

    const technician = await pack_test(test_input, test_name)
        .packed_bind(create_new_technician).unpack();

    // correct imediate return
    if(is_successful_query(technician)) {
        expect(technician.name).toBe(test_input.name);
        expect(technician.color).toBe(test_input.color);
        expect(technician.active).toBe(true);
    } else {
        fail();
    }
    
    const created = await pack_test({ id: technician.id }, test_name)
        .bind(retrieve_technician_entry).unpack();
    
    // correct value stored in database
    if(is_successful_query(created)) {
        expect(created.name).toBe(test_input.name);
        expect(created.color).toBe(test_input.color);
        expect(created.active).toBe(true);
    }

    const roster = await pack_test({ location_id: salon.id }, test_name).bind(retrieve_roster).unpack();

    if(is_successful_query(roster)) {
        roster.includes({ technician_id: technician.id, color: technician.color })
    }
})

test("test change technician activity querry", async () => {
    const test_name = test_suit.concat("/test_technician_activity_query/");

    const test_techniclan_data = {
        name: "Tinn",
        color: "Mulalala",
        active: false,
    }

    const test_tech = pack_test(test_techniclan_data, test_name)
        .bind(create_technician_entry);
    
    let active_tech = await test_tech.bind(mark_technician_active).unpack();

    if(is_successful_query(active_tech)) {
        expect(active_tech.name).toBe(test_techniclan_data.name);
        expect(active_tech.color).toBe(test_techniclan_data.color);
        expect(active_tech.active).toBe(true);
    } else {
        fail();
    }

    active_tech = await test_tech.bind(mark_technician_active).unpack();

    if(is_successful_query(active_tech)) {
        expect(active_tech.name).toBe(test_techniclan_data.name);
        expect(active_tech.color).toBe(test_techniclan_data.color);
        expect(active_tech.active).toBe(true);
    } else {
        fail();
    }

    let inactive_tech = await test_tech.bind(mark_technician_inactive).unpack();

    if(is_successful_query(inactive_tech)) {
        expect(inactive_tech.name).toBe(test_techniclan_data.name);
        expect(inactive_tech.color).toBe(test_techniclan_data.color);
        expect(inactive_tech.active).toBe(false);
    } else {
        fail();
    }

    inactive_tech = await test_tech.bind(mark_technician_inactive).unpack();

    if(is_successful_query(inactive_tech)) {
        expect(inactive_tech.name).toBe(test_techniclan_data.name);
        expect(inactive_tech.color).toBe(test_techniclan_data.color);
        expect(inactive_tech.active).toBe(false);
    } else {
        fail();
    }
})

test("test load all technician querry", async () => {
    const test_name = test_suit.concat("/test_load_all_technician_query/");

    const technician_1 = {
        name: "banana",
        color: "bruh-nuh-nuh",
        active: true,
    }

    const technician_2 = {
        name: "owanges",
        color: "owonges",
        active: false,
    }

    const t1 = await pack_test(technician_1, test_name).bind(create_technician_entry).unpack();
    const t2 = await pack_test(technician_2, test_name).bind(create_technician_entry).unpack();

    if(is_server_error(t1) || is_server_error(t2)) {
        fail();
    }
    
    const v: void = undefined;
    let tech_list: Technician[] | QueryError = await pack_test(v, test_name).bind(get_all_technicians).unpack();

    if(is_successful_query(tech_list)) {
        expect(tech_list).toHaveLength(2);
        expect(tech_list[0]!.name).toBe(technician_1.name);
        expect(tech_list[0]!.color).toBe(technician_1.color);
        expect(tech_list[1]!.name).toBe(technician_2.name);
        expect(tech_list[1]!.color).toBe(technician_2.color);
    } else {
        fail();
    }
    
    const del = await pack_test({ id: t1.id }, test_name).bind(delete_technician_entry).unpack();
    
    if (is_server_error(del)) {
        fail();
    }

    tech_list = await pack_test(v, test_name).bind(get_all_technicians).unpack();

    if(is_successful_query(tech_list)) {
        expect(tech_list).toHaveLength(1);
        expect(tech_list[0]!.name).toBe(technician_2.name);
        expect(tech_list[0]!.color).toBe(technician_2.color);
    } else {
        fail();
    }
})

/*
// export async function create_new_technician(


// export async function get_all_technicians(redirect = ""): Promise<Technician[]> {

test("test load all active technician querry", async () => {
    const test_name = test_suit.concat("/test_load_all_active_technician_query/");

    const technician_1 = {
        name: "banana",
        color: "bruh-nuh-nuh"
    }

    const technician_2 = {
        name: "owanges",
        color: "owonges"
    }

    const t1: Technician = await create_new_technician(technician_1, test_name);
    await create_new_technician(technician_2, test_name);

    let tech_list: Technician[] = await get_active_technicians(test_name);

    expect(tech_list).toHaveLength(2);
    expect(tech_list[0]!.name).toBe(technician_1.name);
    expect(tech_list[0]!.color).toBe(technician_1.color);
    expect(tech_list[1]!.name).toBe(technician_2.name);
    expect(tech_list[1]!.color).toBe(technician_2.color);
    
    await mark_technician_inactive(t1, test_name);
    
    tech_list = await get_active_technicians(test_name);
    expect(tech_list).toHaveLength(1);
    expect(tech_list[0]!.name).toBe(technician_2.name);
    expect(tech_list[0]!.color).toBe(technician_2.color);
})
*/
