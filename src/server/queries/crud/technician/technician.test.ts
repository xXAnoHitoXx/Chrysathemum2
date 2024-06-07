import { clear_test_data } from "~/server/db_schema/fb_schema";
import { create_technician_entry, delete_technician_entry, retrieve_technician_entry, update_technician_entry } from "./technician_entry";
import { create_technician_login_index, delete_technician_login_index, retrieve_technician_id_from_user_id } from "./technician_login_index";
import { create_technician_migration_index, delete_technician_migration_index, retrieve_technician_id_from_legacy_id } from "./technician_migration_index";
import type { Technician } from "~/server/db_schema/type_def";
import { QueryError, is_successful_query, pack_test } from "../../queries_monad";

const test_suit = "tech_cruds";

afterAll(async () => {
    const res = await clear_test_data(test_suit);
    expect(is_successful_query(res)).toBe(true);
})

test("test technician entries CRUD queries", async () => {
    const test_name = test_suit.concat("/test_customer_entries_cruds/");
    const test_technician_entry: Technician | QueryError = await 
        pack_test({name: "Tinn", color: "blu", active: false}, test_name)
        .bind(create_technician_entry)
        .unpack();

    if (!is_successful_query(test_technician_entry)) {
        fail();
    }

    const created_technician_entry: Technician | QueryError = await 
        pack_test({ id: test_technician_entry.id }, test_name)
        .bind(retrieve_technician_entry)
        .unpack();

    if (is_successful_query(created_technician_entry)) {
        expect(created_technician_entry.id).toBe(test_technician_entry.id);
        expect(created_technician_entry.name).toBe(test_technician_entry.name);
        expect(created_technician_entry.color).toBe(test_technician_entry.color);
        expect(created_technician_entry.active).toBe(test_technician_entry.active);
    } else {
        fail();
    }

    const update_target: Technician = {
        id: test_technician_entry.id, name: "chicken", color: "yolo", active: true,
    };

    await pack_test(update_target, test_name)
        .bind(update_technician_entry)
        .unpack();

    const updated_technician_entry: Technician | QueryError = await 
        pack_test({ id: test_technician_entry.id }, test_name)
        .bind(retrieve_technician_entry)
        .unpack();

    if(is_successful_query(updated_technician_entry)){
        expect(updated_technician_entry.id).toBe(update_target.id);
        expect(updated_technician_entry.name).toBe(update_target.name);
        expect(updated_technician_entry.color).toBe(update_target.color);
        expect(updated_technician_entry.active).toBe(update_target.active);
    } else {
        fail();
    }

    await pack_test({ id: test_technician_entry.id }, test_name)
        .bind(delete_technician_entry)
        .unpack();

    const no_technician_entry: Technician | QueryError = await 
        pack_test({ id: test_technician_entry.id }, test_name)
        .bind(retrieve_technician_entry)
        .unpack();

    expect(is_successful_query(no_technician_entry)).toBe(false);
});


test("test technician_login_index CRUDs querries", async () => {
    const test_name = test_suit.concat("/test_technician_login_index_cruds/");

    const login = {
        user_id: "banana",
        technician_id: "bruh-nuh-nuh"
    };

    let conversion = await 
        pack_test({ user_id: login.user_id }, test_name)
        .bind(retrieve_technician_id_from_user_id)
        .unpack();

    expect(is_successful_query(conversion)).toBe(false);

    await pack_test(login, test_name)
        .bind(create_technician_login_index)
        .unpack();

    conversion = await
        pack_test({ user_id: login.user_id }, test_name)
        .bind(retrieve_technician_id_from_user_id)
        .unpack();

    if(is_successful_query(conversion)) {
        expect(conversion.technician_id).toBe(login.technician_id);
    } else {
        fail();
    }

    await pack_test({ user_id: login.user_id }, test_name)
        .bind(delete_technician_login_index)
        .unpack();

    conversion = await
        pack_test({ user_id: login.user_id }, test_name)
        .bind(retrieve_technician_id_from_user_id)
        .unpack();

    expect(is_successful_query(conversion)).toBe(false);
})

test("test technician_migration_index CRUDs querries", async () => {
    const test_name = test_suit.concat("/test_technician_migration_index_cruds/");

    const migration = {
        legacy_id: "banana",
        technician_id: "bruh-nuh-nuh"
    };

    let conversion = await 
        pack_test({ legacy_id: migration.legacy_id }, test_name)
        .bind(retrieve_technician_id_from_legacy_id)
        .unpack();

    expect(is_successful_query(conversion)).toBe(false);

    await pack_test(migration, test_name)
        .bind(create_technician_migration_index)
        .unpack()

    conversion = await
        pack_test({ legacy_id: migration.legacy_id }, test_name)
        .bind(retrieve_technician_id_from_legacy_id)
        .unpack();

    if (is_successful_query(conversion)) {
        expect(conversion.technician_id).toBe(migration.technician_id);
    } else {
        fail();
    }

    await pack_test({ legacy_id: migration.legacy_id }, test_name)
        .bind(delete_technician_migration_index)
        .unpack();

    conversion = await
        pack_test({ legacy_id: migration.legacy_id }, test_name)
        .bind(retrieve_technician_id_from_legacy_id)
        .unpack();

    expect(is_successful_query(conversion)).toBe(false);
})

