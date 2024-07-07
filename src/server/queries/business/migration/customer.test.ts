import { clear_test_data } from "~/server/db_schema/fb_schema";
import { migrate_customer_data } from "./customer";
import { is_successful_query, pack_test } from "../../server_queries_monad";
import { OldCustomerData } from "~/app/api/migration/customer/validation";
import { retrieve_customer_entry } from "../../crud/customer/customer_entry";
import { retrieve_customer_phone_index } from "../../crud/customer/customer_phone_index";
import { retrieve_customer_id_from_legacy_id } from "../../crud/customer/customer_migration_index";

const test_suit = "customer_migration_test";

afterAll(async () => {
    await clear_test_data(test_suit);
})

test("customer migration", async () => {
    const test_name = test_suit.concat("/customer_migration/");

    const simple_customer: OldCustomerData = {
        id: "clef",
        name: "clefable",
        phoneNumber: "cleffy"
    }

    const migrated_customer = await pack_test(simple_customer, test_name)
        .packed_bind(migrate_customer_data).unpack();

    if(is_successful_query(migrated_customer)) {
        expect(migrated_customer.id).not.toBe(simple_customer.id);
        expect(migrated_customer.name).toBe(simple_customer.name);
        expect(migrated_customer.phone_number).toBe(simple_customer.phoneNumber);
        expect(migrated_customer.notes).toBe("");
    } else {
        fail();
    }

    const created_customer_entry = await pack_test({ customer_id: migrated_customer.id }, test_name)
        .bind(retrieve_customer_entry)
        .unpack();

    if(is_successful_query(created_customer_entry)) {
        expect(created_customer_entry.id).toBe(migrated_customer.id);
        expect(created_customer_entry.name).toBe(migrated_customer.name);
        expect(created_customer_entry.phone_number).toBe(migrated_customer.phone_number);
        expect(created_customer_entry.notes).toBe(migrated_customer.notes);
    } else {
        fail();
    }

    const phone_index = await pack_test({ phone_number: simple_customer.phoneNumber }, test_name)
        .bind(retrieve_customer_phone_index)
        .unpack();

    if (is_successful_query(phone_index)) {
        expect(phone_index.customer_ids).toContain(migrated_customer.id);
    }
    
    const id_index = await pack_test({ legacy_id: simple_customer.id }, test_name)
        .bind(retrieve_customer_id_from_legacy_id)
        .unpack();

    if(is_successful_query(id_index)) {
        expect(id_index.customer_id).not.toBeNull();
        expect(id_index.customer_id).toBe(migrated_customer.id);
    } else {
        fail();
    }

    const updated: OldCustomerData = {
        id: simple_customer.id,
        name: "cleffy",
        phoneNumber: "bonanza"
    }

    const remigrated_customer = await pack_test(updated, test_name)
        .packed_bind(migrate_customer_data).unpack();

    if(is_successful_query(remigrated_customer)) {
        expect(remigrated_customer.id).toBe(migrated_customer.id);
        expect(remigrated_customer.name).toBe(updated.name);
        expect(remigrated_customer.phone_number).toBe(updated.phoneNumber);
        expect(remigrated_customer.notes).toBe("");
    } else {
        fail();
    }

    const updated_customer_entry = await pack_test({ customer_id: migrated_customer.id }, test_name)
        .bind(retrieve_customer_entry)
        .unpack();

    if(is_successful_query(updated_customer_entry)) {
        expect(updated_customer_entry.id).toBe(remigrated_customer.id);
        expect(updated_customer_entry.name).toBe(remigrated_customer.name);
        expect(updated_customer_entry.phone_number).toBe(remigrated_customer.phone_number);
        expect(updated_customer_entry.notes).toBe(remigrated_customer.notes);
    } else {
        fail();
    }

    const old_phone_index = await pack_test({ phone_number: simple_customer.phoneNumber }, test_name)
        .bind(retrieve_customer_phone_index)
        .unpack();

    if (is_successful_query(old_phone_index)) {
        expect(old_phone_index.customer_ids).not.toContain(remigrated_customer.id);
    }

    const new_phone_index = await pack_test({ phone_number: updated.phoneNumber }, test_name)
        .bind(retrieve_customer_phone_index)
        .unpack();

    if (is_successful_query(new_phone_index)) {
        expect(new_phone_index.customer_ids).toContain(remigrated_customer.id);
    }
})
