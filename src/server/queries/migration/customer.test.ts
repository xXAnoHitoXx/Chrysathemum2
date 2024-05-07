import { clear_test_data, type Customer } from "~/server/db_schema/fb_schema";
import { type Old_Customer_Data, migrate_customer_data } from "./customer";
import { retrieve_customer_entry } from "../crud/customer/customer_entry";
import { retrieve_customer_phone_index } from "../crud/customer/customer_phone_index";
import { retrieve_customer_id_from_legacy_id } from "../crud/customer/customer_migration_index";

const test_suit = "customer_migration_test";

afterAll(async () => {
    await clear_test_data(test_suit);
})

test("simple migration", async () => {
    const test_name = test_suit.concat("/simple_migration/");

    const simple_customer: Old_Customer_Data = {
        id: "clef",
        name: "clefable",
        phoneNumber: "cleffy"
    }

    const migrated_customer: Customer = await migrate_customer_data(simple_customer, test_name);

    const created_customer_entry: Customer | null = await retrieve_customer_entry(migrated_customer.id, test_name);

    expect(created_customer_entry).not.toBeNull();
    if(created_customer_entry != null){
        expect(created_customer_entry.id).toBe(migrated_customer.id);
        expect(created_customer_entry.name).toBe(migrated_customer.name);
        expect(created_customer_entry.phone_number).toBe(migrated_customer.phone_number);
        expect(created_customer_entry.notes).toBe(migrated_customer.notes);
    }

    expect(migrated_customer.id).not.toBe(simple_customer.id);
    expect(migrated_customer.name).toBe(simple_customer.name);
    expect(migrated_customer.phone_number).toBe(simple_customer.phoneNumber);
    expect(migrated_customer.notes).toBe("");

    const phone_index: string[] = await retrieve_customer_phone_index(simple_customer.phoneNumber, test_name);
    expect(phone_index).toContain(migrated_customer.id);

    const id_index: string | null = await retrieve_customer_id_from_legacy_id(simple_customer.id, test_name);
    expect(id_index).not.toBeNull();
    expect(id_index).toBe(migrated_customer.id);
})

test("re-migration migration", async () => {
    const test_name = test_suit.concat("/re_migration/");

    const simple_customer: Old_Customer_Data = {
        id: "clef",
        name: "clefable", 
        phoneNumber: "cleffy"
    }

    const migrated_customer: Customer = await migrate_customer_data(simple_customer, test_name);

    const updated: Old_Customer_Data = {
        id: simple_customer.id,
        name: "cleffy",
        phoneNumber: "bonanza"
    }

    const remigrated_customer: Customer = await migrate_customer_data(updated, test_name);
    expect(remigrated_customer.id).toBe(migrated_customer.id);

    const created_customer_entry: Customer | null = await retrieve_customer_entry(migrated_customer.id, test_name);

    expect(created_customer_entry).not.toBeNull();
    if(created_customer_entry != null){
        expect(created_customer_entry.id).toBe(remigrated_customer.id);
        expect(created_customer_entry.name).toBe(remigrated_customer.name);
        expect(created_customer_entry.phone_number).toBe(remigrated_customer.phone_number);
        expect(created_customer_entry.notes).toBe(remigrated_customer.notes);
    }

    expect(remigrated_customer.id).not.toBe(simple_customer.id);
    expect(remigrated_customer.name).toBe(updated.name);
    expect(remigrated_customer.phone_number).toBe(updated.phoneNumber);
    expect(remigrated_customer.notes).toBe("");

    const phone_index: string[] = await retrieve_customer_phone_index(simple_customer.phoneNumber, test_name);
    expect(phone_index).not.toContain(migrated_customer.id);

    const actual_phone_index: string[] = await retrieve_customer_phone_index(updated.phoneNumber, test_name);
    expect(actual_phone_index).toContain(migrated_customer.id);

    const id_index: string | null = await retrieve_customer_id_from_legacy_id(simple_customer.id, test_name);
    expect(id_index).not.toBeNull();
    expect(id_index).toBe(migrated_customer.id);
})
