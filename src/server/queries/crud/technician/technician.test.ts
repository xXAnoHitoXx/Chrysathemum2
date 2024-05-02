import { clear_test_data, type Technician } from "~/server/db_schema/fb_schema";
import { create_technician_entry, delete_technician_entry, retrieve_technician_entry, update_technician_entry } from "./technician_entry";
import { create_technician_login_index, delete_technician_login_index, retrieve_technician_id_from_user_id } from "./technician_login_index";
import { create_technician_migration_index, delete_technician_migration_index, retrieve_technician_id_from_legacy_id } from "./technician_migration_index";

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


test("test technician_login_index CRUDs querries", async () => {
    const test_name = test_suit.concat("/test_technician_login_index_cruds/");

    const login = {
        user_id: "banana",
        tech_id: "bruh-nuh-nuh"
    };

    let conversion: string | null = await retrieve_technician_id_from_user_id(login.user_id, test_name);
    expect(conversion).toBeNull();

    await create_technician_login_index({user_id: login.user_id, technician_id: login.tech_id}, test_name);

    conversion = await retrieve_technician_id_from_user_id(login.user_id, test_name);
    expect(conversion).toBe(login.tech_id);

    await delete_technician_login_index(login.user_id, test_name);

    conversion = await retrieve_technician_id_from_user_id(login.user_id, test_name);
    expect(conversion).toBeNull();
})

test("test technician_migration_index CRUDs querries", async () => {
    const test_name = test_suit.concat("/test_technician_migration_index_cruds/");

    const migration = {
        legacy_id: "banana",
        tech_id: "bruh-nuh-nuh"
    };

    let conversion: string | null = await retrieve_technician_id_from_legacy_id(migration.legacy_id, test_name);
    expect(conversion).toBeNull();

    await create_technician_migration_index({legacy_id: migration.legacy_id, technician_id: migration.tech_id}, test_name);

    conversion = await retrieve_technician_id_from_legacy_id(migration.legacy_id, test_name);
    expect(conversion).toBe(migration.tech_id);

    await delete_technician_migration_index(migration.legacy_id, test_name);

    conversion = await retrieve_technician_id_from_legacy_id(migration.legacy_id, test_name);
    expect(conversion).toBeNull();
})

