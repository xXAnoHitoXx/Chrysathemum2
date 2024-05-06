import { clear_test_data, type Customer } from "~/server/db_schema/fb_schema";
import { type Old_Customer_Data, migrate_customer } from "./customer";
import { retrieve_customer_entry } from "../crud/customer/customer_entry";
import { retrieve_customer_phone_index } from "../crud/customer/customer_phone_index";
import { retrieve_customer_id_from_legacy_id } from "../crud/customer/customer_migration_index";

const test_suit = "customer_migration_test";

afterAll(async () => {
    await clear_test_data(test_suit);
})

test("simple migration", async () => {
    const test_name = test_suit.concat("/test_customer_entries_cruds/");

    const simple_customer: Old_Customer_Data = {
        id: "clef",
        name: "clefable",
        phone_number: "cleffy"
    }

    const migrated_customer: Customer = await migrate_customer(simple_customer, test_name);

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
    expect(migrated_customer.phone_number).toBe(simple_customer.phone_number);

    const phone_index: string[] = await retrieve_customer_phone_index(simple_customer.phone_number, test_name);
    expect(phone_index).toContain(migrated_customer.id);

    const id_index: string | null = await retrieve_customer_id_from_legacy_id(simple_customer.id, test_name);
    expect(id_index).not.toBeNull();
    expect(id_index).toBe(migrated_customer.id);
})
