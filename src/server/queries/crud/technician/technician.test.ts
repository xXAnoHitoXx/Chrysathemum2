import { clear_test_data } from "~/server/db_schema/fb_schema";
import { create_technician_entry, delete_technician_entry, retrieve_technician_entry, update_technician_entry } from "./technician_entry";
import { create_technician_login_index, delete_technician_login_index, retrieve_technician_id_from_user_id } from "./technician_login_index";
import { create_technician_migration_index, delete_technician_migration_index, retrieve_technician_id_from_legacy_id } from "./technician_migration_index";
import{ Technician } from "~/server/db_schema/type_def";
import { pack_test } from "../../server_queries_monad";
import { is_data_error } from "~/server/data_error";

const test_suit = "tech_cruds";

afterAll(async () => {
    const res = await clear_test_data(test_suit);
    expect(is_data_error(res)).toBe(false);
})

test("test technician entries CRUD queries", async () => {
    const test_name = test_suit.concat("/test_customer_entries_cruds/");
    const test_technician_entry = await 
        pack_test({name: "Tinn", color: "blu", active: false}, test_name)
        .bind(create_technician_entry)
        .unpack();

    if (is_data_error(test_technician_entry)) {
        test_technician_entry.log();
        fail();
    }

    const created_technician_entry = await 
        pack_test({ id: test_technician_entry.id }, test_name)
        .bind(retrieve_technician_entry)
        .unpack();

    if (!is_data_error(created_technician_entry)) {
        expect(created_technician_entry.id).toBe(test_technician_entry.id);
        expect(created_technician_entry.name).toBe(test_technician_entry.name);
        expect(created_technician_entry.color).toBe(test_technician_entry.color);
        expect(created_technician_entry.active).toBe(test_technician_entry.active);
    } else {
        created_technician_entry.log();
        fail();
    }

    const update_target: Technician = {
        id: test_technician_entry.id, name: "chicken", color: "yolo", active: true,
    };

    await pack_test(update_target, test_name)
        .bind(update_technician_entry)
        .unpack();

    const updated_technician_entry = await 
        pack_test({ id: test_technician_entry.id }, test_name)
        .bind(retrieve_technician_entry)
        .unpack();

    if(!is_data_error(updated_technician_entry)){
        expect(updated_technician_entry.id).toBe(update_target.id);
        expect(updated_technician_entry.name).toBe(update_target.name);
        expect(updated_technician_entry.color).toBe(update_target.color);
        expect(updated_technician_entry.active).toBe(update_target.active);
    } else {
        updated_technician_entry.log();
        fail();
    }

    await pack_test({ id: test_technician_entry.id }, test_name)
        .bind(delete_technician_entry)
        .unpack();

    const no_technician_entry = await 
        pack_test({ id: test_technician_entry.id }, test_name)
        .bind(retrieve_technician_entry)
        .unpack();

    expect(is_data_error(no_technician_entry)).toBe(true);
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

    expect(is_data_error(conversion)).toBe(true);

    await pack_test(login, test_name)
        .bind(create_technician_login_index)
        .unpack();

    conversion = await
        pack_test({ user_id: login.user_id }, test_name)
        .bind(retrieve_technician_id_from_user_id)
        .unpack();

    if(!is_data_error(conversion)) {
        expect(conversion.technician_id).toBe(login.technician_id);
    } else {
        conversion.log();
        fail();
    }

    await pack_test({ user_id: login.user_id }, test_name)
        .bind(delete_technician_login_index)
        .unpack();

    conversion = await
        pack_test({ user_id: login.user_id }, test_name)
        .bind(retrieve_technician_id_from_user_id)
        .unpack();

    expect(is_data_error(conversion)).toBe(true);
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

    expect(is_data_error(conversion)).toBe(true);

    await pack_test(migration, test_name)
        .bind(create_technician_migration_index)
        .unpack()

    conversion = await
        pack_test({ legacy_id: migration.legacy_id }, test_name)
        .bind(retrieve_technician_id_from_legacy_id)
        .unpack();

    if (!is_data_error(conversion)) {
        expect(conversion.technician_id).toBe(migration.technician_id);
    } else {
        conversion.log();
        fail();
    }

    await pack_test({ legacy_id: migration.legacy_id }, test_name)
        .bind(delete_technician_migration_index)
        .unpack();

    conversion = await
        pack_test({ legacy_id: migration.legacy_id }, test_name)
        .bind(retrieve_technician_id_from_legacy_id)
        .unpack();

    expect(is_data_error(conversion)).toBe(true);
})

