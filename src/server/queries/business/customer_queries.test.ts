import { clear_test_data, type Customer } from "~/server/db_schema/fb_schema";
import { create_new_customer, update_customer_info } from "./customer_queries";
import { retrieve_customer_entry } from "../crud/customer/customer_entry";
import { retrieve_customer_phone_index } from "../crud/customer/customer_phone_index";

const test_suit = "customer_business_logic";

afterAll(async () => {
    await clear_test_data(test_suit);
})

test("customer creation", async () => {
    const test_name = test_suit.concat("/customer_creation/");

    const customer_info = {
        name: "Justin",
        phone_number: "Thyme"
    };

    const customer: Customer = await create_new_customer(customer_info, test_name);
    expect(customer.name).toBe(customer_info.name);
    expect(customer.phone_number).toBe(customer_info.phone_number);

    const entry: Customer | null = await retrieve_customer_entry(customer.id, test_name);
    expect(entry).not.toBeNull();
    if(entry != null){
        expect(entry.id).toBe(customer.id);
        expect(entry.name).toBe(customer.name);
        expect(entry.phone_number).toBe(customer.phone_number);
    }

    const phone_index: string[] = await retrieve_customer_phone_index(customer.phone_number, test_name);
    expect(phone_index).toContain(customer.id);
})

test("update customer info", async () => {
    const test_name = test_suit.concat("/customer_creation/");

    const customer_info = {
        name: "Justin",
        phone_number: "Thyme"
    };

    const starting_customer: Customer = await create_new_customer(customer_info, test_name);

    const name_change_info = {
        name: "Justin Wong"
    }

    const name_changed: Customer = await update_customer_info(starting_customer, name_change_info, test_name);
    const name_changed_entry: Customer | null = await retrieve_customer_entry(name_changed.id, test_name);

    expect(name_changed_entry).not.toBeNull();
    if(name_changed_entry != null) {
        expect(name_changed_entry.id).toBe(starting_customer.id);
        expect(name_changed_entry.name).toBe(name_change_info.name);
        expect(name_changed_entry.phone_number).toBe(starting_customer.phone_number);
    }

    expect(name_changed.id).toBe(starting_customer.id);
    expect(name_changed.name).toBe(name_change_info.name);
    expect(name_changed.phone_number).toBe(starting_customer.phone_number);

    const phone_change_info = {
        phone_number: "Evo Moment 37"
    }

    const phone_changed: Customer = await update_customer_info(name_changed, phone_change_info, test_name);
    const phone_changed_entry: Customer | null = await retrieve_customer_entry(name_changed.id, test_name);

    expect(phone_changed_entry).not.toBeNull();
    if(phone_changed_entry != null) {
        expect(phone_changed_entry.id).toBe(starting_customer.id);
        expect(phone_changed_entry.phone_number).toBe(phone_change_info.phone_number);
        expect(phone_changed_entry.name).toBe(name_changed.name);
    }

    expect(phone_changed.id).toBe(starting_customer.id);
    expect(phone_changed.phone_number).toBe(phone_change_info.phone_number);
    expect(phone_changed.name).toBe(name_changed.name);

    let phone_index: string[] = await retrieve_customer_phone_index(phone_change_info.phone_number, test_name);
    expect(phone_index).toContain(starting_customer.id);

    let old_phone_index: string[] = await retrieve_customer_phone_index(customer_info.phone_number, test_name);
    expect(old_phone_index).not.toContain(starting_customer.id);

    const change_both_at_the_same_time: Customer = await update_customer_info(phone_changed, customer_info, test_name);
    const change_both_at_the_same_time_entry: Customer | null = await retrieve_customer_entry(phone_changed.id, test_name);

    expect(change_both_at_the_same_time_entry).not.toBeNull();
    if(change_both_at_the_same_time_entry != null) {
        expect(change_both_at_the_same_time_entry.id).toBe(starting_customer.id);
        expect(change_both_at_the_same_time_entry.phone_number).toBe(starting_customer.phone_number);
        expect(change_both_at_the_same_time_entry.name).toBe(starting_customer.name);
    }

    expect(change_both_at_the_same_time.id).toBe(starting_customer.id);
    expect(change_both_at_the_same_time.phone_number).toBe(starting_customer.phone_number);
    expect(change_both_at_the_same_time.name).toBe(starting_customer.name);

    old_phone_index = await retrieve_customer_phone_index(phone_change_info.phone_number, test_name);
    phone_index = await retrieve_customer_phone_index(starting_customer.phone_number, test_name);

    expect(phone_index).toContain(starting_customer.id);
    expect(old_phone_index).not.toContain(starting_customer.id);
})
