import type { Customer } from "~/server/db_schema/fb_schema";
import { create_customer_entry, delete_customer_entry, retrieve_customer_entry, update_customer_entry } from "./customer_entry"

test("test customer_entries CRUDs querries", async () => {
    const test_name = "test_customer_entries_cruds";
    const test_customer_entry: Customer = await create_customer_entry("Tinn", "your mother is a murloc", test_name);

    const created_customer_entry: Customer | null = await retrieve_customer_entry(test_customer_entry.id, test_name);
    
    expect(created_customer_entry).not.toBeNull();
    if (created_customer_entry != null) {
        expect(created_customer_entry.id).toBe(test_customer_entry.id);
        expect(created_customer_entry.name).toBe(test_customer_entry.name);
        expect(created_customer_entry.phone_number).toBe(test_customer_entry.phone_number);
    }

    const update_target: Customer = {
        id: test_customer_entry.id,
        name: "AnoHito",
        phone_number: "your mother is a colosal murloc",
    };

    await update_customer_entry(update_target, test_name);
    const updated_customer_entry: Customer | null = await retrieve_customer_entry(test_customer_entry.id, test_name);

    expect(updated_customer_entry).not.toBeNull();
    if (updated_customer_entry != null) {
        expect(updated_customer_entry.id).toBe(update_target.id);
        expect(updated_customer_entry.name).toBe(update_target.name);
        expect(updated_customer_entry.phone_number).toBe(update_target.phone_number);
    }

    await delete_customer_entry(updated_customer_entry!, test_name);

    const empty_customer_entry: Customer | null = await retrieve_customer_entry(test_customer_entry.id, test_name);
    expect(empty_customer_entry).toBeNull();
})
