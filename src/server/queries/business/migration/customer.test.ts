import { clear_test_data } from "~/server/db_schema/fb_schema";
import { migrate_customer_data } from "./customer";
import { pack_test } from "../../server_queries_monad";
import { OldCustomerData } from "~/app/api/migration/customer/validation";
import { retrieve_customer_entry } from "../../crud/customer/customer_entry";
import { retrieve_customer_phone_index } from "../../crud/customer/customer_phone_index";
import { retrieve_customer_id_from_legacy_id } from "../../crud/customer/customer_migration_index";
import { is_data_error } from "~/server/data_error";

const test_suit = "customer_migration_test";

afterAll(async () => {
    await clear_test_data(test_suit);
});

test("customer migration", async () => {
    const test_name = test_suit.concat("/customer_migration/");

    const simple_customer: OldCustomerData = {
        id: "clef",
        name: "clefable",
        phoneNumber: "cleffy",
    };

    const migrated_customer = await pack_test(simple_customer, test_name)
        .bind(migrate_customer_data)
        .unpack();

    if (is_data_error(migrated_customer)) {
        migrated_customer.log();
        fail();
    }

    expect(migrated_customer.id).not.toBe(simple_customer.id);
    expect(migrated_customer.name).toBe(simple_customer.name);
    expect(migrated_customer.phone_number).toBe(simple_customer.phoneNumber);
    expect(migrated_customer.notes).toBe("");

    const created_customer_entry = await pack_test(
        { customer_id: migrated_customer.id },
        test_name,
    )
        .bind(retrieve_customer_entry)
        .unpack();

    if (is_data_error(created_customer_entry)) {
        created_customer_entry.log();
        fail();
    }

    expect(created_customer_entry.id).toBe(migrated_customer.id);
    expect(created_customer_entry.name).toBe(migrated_customer.name);
    expect(created_customer_entry.phone_number).toBe(
        migrated_customer.phone_number,
    );
    expect(created_customer_entry.notes).toBe(migrated_customer.notes);

    const phone_index = await pack_test(
        { phone_number: simple_customer.phoneNumber },
        test_name,
    )
        .bind(retrieve_customer_phone_index)
        .unpack();

    if (is_data_error(phone_index)) {
        phone_index.log();
        fail();
    }

    expect(phone_index.error).toBeNull();
    expect(phone_index.data.customer_ids).toContain(migrated_customer.id);

    const id_index = await pack_test(
        { legacy_id: simple_customer.id },
        test_name,
    )
        .bind(retrieve_customer_id_from_legacy_id)
        .unpack();

    if (is_data_error(id_index)) {
        id_index.log();
        fail();
    }

    expect(id_index.customer_id).not.toBeNull();
    expect(id_index.customer_id).toBe(migrated_customer.id);

    const updated: OldCustomerData = {
        id: simple_customer.id,
        name: "cleffy",
        phoneNumber: "bonanza",
    };

    const remigrated_customer = await pack_test(updated, test_name)
        .bind(migrate_customer_data)
        .unpack();

    if (is_data_error(remigrated_customer)) {
        remigrated_customer.log();
        fail();
    }

    expect(remigrated_customer.id).toBe(migrated_customer.id);
    expect(remigrated_customer.name).toBe(updated.name);
    expect(remigrated_customer.phone_number).toBe(updated.phoneNumber);
    expect(remigrated_customer.notes).toBe("");

    const updated_customer_entry = await pack_test(
        { customer_id: migrated_customer.id },
        test_name,
    )
        .bind(retrieve_customer_entry)
        .unpack();

    if (is_data_error(updated_customer_entry)) {
        updated_customer_entry.log();
        fail();
    }

    expect(updated_customer_entry.id).toBe(remigrated_customer.id);
    expect(updated_customer_entry.name).toBe(remigrated_customer.name);
    expect(updated_customer_entry.phone_number).toBe(
        remigrated_customer.phone_number,
    );
    expect(updated_customer_entry.notes).toBe(remigrated_customer.notes);

    const old_phone_index = await pack_test(
        { phone_number: simple_customer.phoneNumber },
        test_name,
    )
        .bind(retrieve_customer_phone_index)
        .unpack();

    if (is_data_error(old_phone_index)) {
        old_phone_index.log();
        fail();
    }

    expect(old_phone_index.error).toBeNull();
    expect(old_phone_index.data.customer_ids).not.toContain(
        remigrated_customer.id,
    );

    const new_phone_index = await pack_test(
        { phone_number: updated.phoneNumber },
        test_name,
    )
        .bind(retrieve_customer_phone_index)
        .unpack();

    if (is_data_error(new_phone_index)) {
        new_phone_index.log();
        fail();
    }

    expect(new_phone_index.error).toBeNull();
    expect(new_phone_index.data.customer_ids).toContain(remigrated_customer.id);
});
