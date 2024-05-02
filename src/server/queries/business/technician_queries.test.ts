import { type Technician, clear_test_data } from "~/server/db_schema/fb_schema";
import { create_new_technician, get_all_technicians, mark_technician_active, mark_technician_inactive } from "./technician_queries";
import { delete_technician_entry, retrieve_technician_entry } from "../crud/technician/technician_entry";

const test_suit = "technician_business_logic";

afterAll(async () => {
    await clear_test_data(test_suit);
})

// export async function create_new_technician(
test("test new technician querry", async () => {
    const test_name = test_suit.concat("/test_technician_creation_query/");

    const test_input = {
        name: "Tinn",
        color: "Mulalala",
    }

    const technician: Technician = await create_new_technician({name: test_input.name, color: test_input.color}, test_name);

    const created: Technician | null = await retrieve_technician_entry(technician.id, test_name);
    
    // correct imediate return
    expect(technician.name).toBe(test_input.name);
    expect(technician.color).toBe(test_input.color);
    expect(technician.active).toBe(true);
    
    // correct value stored in data base
    expect(created).not.toBeNull();
    if(created != null) {
        expect(created.name).toBe(test_input.name);
        expect(created.color).toBe(test_input.color);
        expect(created.active).toBe(true);
    }
})

// export async function mark_technician_inactive(technician: Technician, redirect = "") {
// export async function mark_technician_active(technician: Technician, redirect = "") {
test("test change technician activity querry", async () => {
    const test_name = test_suit.concat("/test_technician_activity_query/");

    const test_techniclan_data = {
        name: "Tinn",
        color: "Mulalala",
    }

    const test_technician: Technician = await create_new_technician({name: test_techniclan_data.name, color: test_techniclan_data.color}, test_name);
    let db_technician: Technician | null = await retrieve_technician_entry(test_technician.id, test_name);

    expect(test_technician.active).toBe(true);
    expect(db_technician).not.toBeNull();
    if(db_technician != null) {
        expect(db_technician.active).toBe(true);
    }

    await mark_technician_active(test_technician, test_name);
    db_technician = await retrieve_technician_entry(test_technician.id, test_name);

    expect(test_technician.active).toBe(true);
    expect(db_technician).not.toBeNull();
    if(db_technician != null) {
        expect(db_technician.active).toBe(true);
    }

    await mark_technician_inactive(test_technician, test_name);
    db_technician = await retrieve_technician_entry(test_technician.id, test_name);

    expect(test_technician.active).toBe(false);
    expect(db_technician).not.toBeNull();
    if(db_technician != null) {
        expect(db_technician.active).toBe(false);
    }

    await mark_technician_inactive(test_technician, test_name);
    db_technician = await retrieve_technician_entry(test_technician.id, test_name);

    expect(test_technician.active).toBe(false);
    expect(db_technician).not.toBeNull();
    if(db_technician != null) {
        expect(db_technician.active).toBe(false);
    }

    await mark_technician_active(test_technician, test_name);
    db_technician = await retrieve_technician_entry(test_technician.id, test_name);

    expect(test_technician.active).toBe(true);
    expect(db_technician).not.toBeNull();
    if(db_technician != null) {
        expect(db_technician.active).toBe(true);
    }
})

// export async function get_all_technicians(redirect = ""): Promise<Technician[]> {
test("test load all technician querry", async () => {
    const test_name = test_suit.concat("/test_load_all_technician_query/");

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

    let tech_list: Technician[] = await get_all_technicians(test_name);

    expect(tech_list).toHaveLength(2);
    expect(tech_list[0]!.name).toBe(technician_1.name);
    expect(tech_list[0]!.color).toBe(technician_1.color);
    expect(tech_list[1]!.name).toBe(technician_2.name);
    expect(tech_list[1]!.color).toBe(technician_2.color);
    
    await delete_technician_entry(t1.id, test_name);
    
    tech_list = await get_all_technicians(test_name);
    expect(tech_list).toHaveLength(1);
    expect(tech_list[0]!.name).toBe(technician_2.name);
    expect(tech_list[0]!.color).toBe(technician_2.color);
})
