import { clear_test_data } from "~/server/db_schema/fb_schema";
import type { Customer } from "~/server/db_schema/type_def";
import { create_customer_entry, delete_customer_entry, retrieve_customer_entry, update_customer_entry } from "./customer_entry"
import { create_customer_phone_index, delete_customer_phone_index, retrieve_customer_phone_index } from "./customer_phone_index";
import { create_customer_migration_index, delete_customer_migration_index, retrieve_customer_id_from_legacy_id } from "./customer_migration_index";
import { QueryError, is_successful_query, pack_test } from "../../server_queries_monad";
import { is_server_error } from "~/server/server_error";

const test_suit = "cust_cruds";

afterAll(async () => {
    const res = await clear_test_data(test_suit);
    expect(is_successful_query(res)).toBe(true);
})

test("test customer_entries CRUDs querries", async () => {
    const test_name = test_suit.concat("/test_customer_entries_cruds/");
    const test_customer_entry: Customer | QueryError = await
        pack_test({name: "Tinn", phone_number: "your mother is a murloc"}, test_name)
        .bind(create_customer_entry)
        .unpack();

    if (is_server_error(test_customer_entry)) {
        fail();
    }

    const created_customer_entry: Customer | QueryError = await 
        pack_test({ customer_id: test_customer_entry.id }, test_name)
        .bind(retrieve_customer_entry)
        .unpack();
    
    if (is_successful_query(created_customer_entry)) {
        expect(created_customer_entry.id).toBe(test_customer_entry.id);
        expect(created_customer_entry.name).toBe(test_customer_entry.name);
        expect(created_customer_entry.phone_number).toBe(test_customer_entry.phone_number);
    } else {
        fail();
    }

    const update_target: Customer = {
        id: test_customer_entry.id,
        name: "AnoHito",
        phone_number: "your mother is a colosal murloc",
        notes: "is cool"
    };

    await pack_test(update_target, test_name)
        .bind(update_customer_entry)
        .unpack()

    const updated_customer_entry: Customer | QueryError = await 
        pack_test({ customer_id: test_customer_entry.id }, test_name)
        .bind(retrieve_customer_entry)
        .unpack()

    if (is_successful_query(updated_customer_entry)) {
        expect(updated_customer_entry.id).toBe(update_target.id);
        expect(updated_customer_entry.name).toBe(update_target.name);
        expect(updated_customer_entry.phone_number).toBe(update_target.phone_number);
        expect(updated_customer_entry.notes).toBe(update_target.notes);
    } else {
        fail();
    }

    await pack_test({ id: test_customer_entry.id }, test_name)
        .bind(delete_customer_entry)
        .unpack();

    const empty_customer_entry: Customer | QueryError = await
        pack_test({ customer_id: test_customer_entry.id }, test_name)
        .bind(retrieve_customer_entry)
        .unpack()

    expect(is_successful_query(empty_customer_entry)).toBe(false);
})

test("test customer_phone_index CRUDs querries", async () => {
    const test_name = test_suit.concat("/test_customer_phone_index_cruds/");

    const customer_1: Customer = {
        id: "Banana",
        name: "Pizza",
        phone_number: "Your Mother",
        notes: "",
    }

    const customer_2: Customer = {
        id: "Anana",
        name: "Pineapple",
        phone_number: "Your Mother",
        notes: "",
    }

    let index: { customer_ids: string[] } | QueryError = await 
        pack_test({ phone_number: customer_1.phone_number }, test_name)
        .bind(retrieve_customer_phone_index) 
        .unpack();

    if(is_successful_query(index)) {
        expect(index.customer_ids).toHaveLength(0);
    } else {
        fail();
    }

    await pack_test(customer_1, test_name)
        .bind(create_customer_phone_index)
        .unpack();
    await pack_test(customer_2, test_name)
        .bind(create_customer_phone_index)
        .unpack();

    index = await 
        pack_test({ phone_number: customer_1.phone_number }, test_name)
        .bind(retrieve_customer_phone_index)
        .unpack();

    if(is_successful_query(index)) {
        expect(index.customer_ids).toHaveLength(2);
        expect(index.customer_ids).toContain(customer_1.id);
        expect(index.customer_ids).toContain(customer_2.id);
    } else {
        fail();
    }

    await pack_test(customer_1, test_name)
        .bind(delete_customer_phone_index)
        .unpack();

    index = await pack_test({ phone_number: customer_1.phone_number }, test_name)
        .bind(retrieve_customer_phone_index)
        .unpack();
    
    if(is_successful_query(index)) {
        expect(index.customer_ids).toHaveLength(1);
        expect(index.customer_ids).not.toContain(customer_1.id);
        expect(index.customer_ids).toContain(customer_2.id);
    } else {
        fail();
    }
})

test("test customer_migration_index CRUDs querries", async () => {
    const test_name = test_suit.concat("/test_customer_migration_index_cruds/");

    const test_ids = { id: "BaNaNa", legacy_id: "banana" };

    let conversion: { customer_id: string | null } | QueryError = await 
        pack_test({ legacy_id: test_ids.legacy_id }, test_name)
        .bind(retrieve_customer_id_from_legacy_id)
        .unpack();

    if(is_successful_query(conversion)) {
        expect(conversion.customer_id).toBeNull();
    } else {
        fail();
    }

    await pack_test({customer_id: test_ids.id, legacy_id: test_ids.legacy_id}, test_name)
        .bind(create_customer_migration_index)
        .unpack();

    conversion = await pack_test({ legacy_id: test_ids.legacy_id }, test_name)
        .bind(retrieve_customer_id_from_legacy_id)
        .unpack();

    if(is_successful_query(conversion)) {
        expect(conversion.customer_id).toBe(test_ids.id);
    } else {
        fail();
    }

    await pack_test({ legacy_id: test_ids.legacy_id }, test_name)
        .bind(delete_customer_migration_index)
        .unpack();

    conversion = await pack_test({ legacy_id: test_ids.legacy_id }, test_name)
        .bind(retrieve_customer_id_from_legacy_id)
        .unpack();

    if(is_successful_query(conversion)) {
        expect(conversion.customer_id).toBeNull();
    } else {
        fail();
    }
})
