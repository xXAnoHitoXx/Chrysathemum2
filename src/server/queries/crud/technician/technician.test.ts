import { clear_test_data, type Technician } from "~/server/db_schema/fb_schema";
import { create_technician_entry, delete_technician_entry, retrieve_technician_entry, update_technician_entry } from "./technician_entry";

const test_suit = "tech_cruds";

afterAll(async () => {
    await clear_test_data(test_suit);
})

test("test technician entries CRUD queries", async () => {
    const test_name = test_suit.concat("/test_customer_entries_cruds/");
    const test_technician_entry: Technician = await create_technician_entry({name: "Tinn", color: "blu", active: false}, test_name);

    const created_technician_entry: Technician | null = await retrieve_technician_entry(test_technician_entry.id, test_name);
    expect(created_technician_entry).not.toBeNull();
    if(created_technician_entry != null){
        expect(created_technician_entry.id).toBe(test_technician_entry.id);
        expect(created_technician_entry.name).toBe(test_technician_entry.name);
        expect(created_technician_entry.color).toBe(test_technician_entry.color);
        expect(created_technician_entry.active).toBe(test_technician_entry.active);
    }

    const update_target: Technician = {
        id: test_technician_entry.id, name: "chicken", color: "yolo", active: true,
    };

    await update_technician_entry(update_target, test_name);

    const updated_technician_entry: Technician | null = await retrieve_technician_entry(test_technician_entry.id, test_name);
    expect(updated_technician_entry).not.toBeNull();
    if(updated_technician_entry != null){
        expect(updated_technician_entry.id).toBe(update_target.id);
        expect(updated_technician_entry.name).toBe(update_target.name);
        expect(updated_technician_entry.color).toBe(update_target.color);
        expect(updated_technician_entry.active).toBe(update_target.active);
    }

    await delete_technician_entry(test_technician_entry.id, test_name);

    const no_technician_entry: Technician | null = await retrieve_technician_entry(test_technician_entry.id, test_name);
    expect(no_technician_entry).toBeNull();
});

