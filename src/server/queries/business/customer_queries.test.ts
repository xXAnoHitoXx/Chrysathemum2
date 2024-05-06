import { clear_test_data, type Customer } from "~/server/db_schema/fb_schema";
import { create_new_customer, is_no_book, update_customer_info } from "./customer_queries";
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

test("update customer name", async () => {
    const test_name = test_suit.concat("/customer_name_update/");
    
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
})

test("update customer phone_number", async () => {
    const test_phone_number = test_suit.concat("/customer_phone_number_update/");
    
    const customer_info = {
        name: "Justin Wong",
        phone_number: "Thyme"
    };

    const starting_customer: Customer = await create_new_customer(customer_info, test_phone_number);

    const phone_number_change_info = {
        phone_number: "Evo Monent 37"
    }

    const phone_number_changed: Customer = await update_customer_info(starting_customer, phone_number_change_info, test_phone_number);
    const phone_number_changed_entry: Customer | null = await retrieve_customer_entry(phone_number_changed.id, test_phone_number);

    expect(phone_number_changed_entry).not.toBeNull();
    if(phone_number_changed_entry != null) {
        expect(phone_number_changed_entry.id).toBe(starting_customer.id);
        expect(phone_number_changed_entry.phone_number).toBe(phone_number_change_info.phone_number);
        expect(phone_number_changed_entry.name).toBe(starting_customer.name);
    }

    expect(phone_number_changed.id).toBe(starting_customer.id);
    expect(phone_number_changed.phone_number).toBe(phone_number_change_info.phone_number);
    expect(phone_number_changed.name).toBe(starting_customer.name);
})

test("update customer notes", async () => {
    const test_notes = test_suit.concat("/customer_notes_update/");
    
    const customer_info = {
        name: "Justin",
        phone_number: "Thyme"
    };

    const starting_customer: Customer = await create_new_customer(customer_info, test_notes);

    const notes_change_info = {
        notes: "Justin Wong"
    }

    const notes_changed: Customer = await update_customer_info(starting_customer, notes_change_info, test_notes);
    const notes_changed_entry: Customer | null = await retrieve_customer_entry(notes_changed.id, test_notes);

    expect(notes_changed_entry).not.toBeNull();
    if(notes_changed_entry != null) {
        expect(notes_changed_entry.id).toBe(starting_customer.id);
        expect(notes_changed_entry.notes).toBe(notes_change_info.notes);
        expect(notes_changed_entry.phone_number).toBe(starting_customer.phone_number);
        expect(notes_changed_entry.name).toBe(starting_customer.name);
    }

    expect(notes_changed.id).toBe(starting_customer.id);
    expect(notes_changed.notes).toBe(notes_change_info.notes);
    expect(notes_changed.phone_number).toBe(starting_customer.phone_number);
    expect(notes_changed.name).toBe(starting_customer.name);
})

test("update customer info", async () => {
    const test_name = test_suit.concat("/customer_info_update/");

    const customer_info = {
        name: "Justin",
        phone_number: "Thyme"
    };

    const customer: Customer = await create_new_customer(customer_info, test_name);

    const update_target = {
        name: "Justin Wong",
        phone_number: "Evo Moment 37",
        notes: "Get Daigo Parried"
    }

    const updated_customer: Customer = await update_customer_info(customer, update_target, test_name);
    const updated_entry: Customer | null = await retrieve_customer_entry(customer.id, test_name);

    expect(updated_entry).not.toBeNull();
    if(updated_entry != null) {
        expect(updated_entry.id).toBe(customer.id);
        expect(updated_entry.name).toBe(update_target.name);
        expect(updated_entry.phone_number).toBe(update_target.phone_number);
        expect(updated_entry.notes).toBe(update_target.notes);
    }

    expect(updated_customer.id).toBe(customer.id);
    expect(updated_customer.name).toBe(update_target.name);
    expect(updated_customer.phone_number).toBe(update_target.phone_number);
    expect(updated_customer.notes).toBe(update_target.notes);
})

test("check for no book flag", () => {
    const customer: Customer = {
        id: "JWong",
        name: "Justin Wong",
        phone_number: "Evo Moment 37",
        notes: "Get Daigo Parried"
    }

    expect(is_no_book(customer)).toBe(false);

    customer.notes = "yolo oh no book";
    expect(is_no_book(customer)).toBe(true);

    customer.notes = "yolo oh nO boOKtranak";
    expect(is_no_book(customer)).toBe(true);

    customer.notes = "yolo oh noboOKtranak";
    expect(is_no_book(customer)).toBe(true);

    customer.notes = "";
    customer.name = "Justin nobook Wong";
    expect(is_no_book(customer)).toBe(true);
})
