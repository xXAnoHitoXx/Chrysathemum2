import { clear_test_data } from "~/server/db_schema/fb_schema";
import type { Customer, CustomerUpdateData } from "~/server/db_schema/type_def";
import { create_new_customer, is_no_book, update_customer_info } from "./customer_queries";
import { retrieve_customer_entry } from "~/server/queries/crud/customer/customer_entry";
import { retrieve_customer_phone_index } from "~/server/queries/crud/customer/customer_phone_index";
import { is_successful_query, pack_test } from "~/server/queries/server_queries_monad";
import { execute_api_query } from "~/server/queries/api/api_queries";
import { is_server_error } from "~/server/server_error";

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

    const customer = await execute_api_query(create_new_customer, pack_test(customer_info, test_name));

    if (is_successful_query(customer)) {
        expect(customer.name).toBe(customer_info.name);
        expect(customer.phone_number).toBe(customer_info.phone_number);
    } else {
        fail();
    }

    const entry = await pack_test({ id: customer.id }, test_name)
        .bind(retrieve_customer_entry).unpack();

    if (is_successful_query(entry)) {
        expect(entry.id).toBe(customer.id);
        expect(entry.name).toBe(customer.name);
        expect(entry.phone_number).toBe(customer.phone_number);
    } else {
        fail();
    }

    const index = await pack_test({ phone_number: customer.phone_number }, test_name)
        .bind(retrieve_customer_phone_index)
        .unpack()

    if (is_successful_query(index)) {
        expect(index.customer_ids).toContain(customer.id);
    } else {
        fail();
    }
})

test("update customer name", async () => {
    const test_name = test_suit.concat("/customer_name_update/");
   
    const customer_info = {
        name: "Justin",
        phone_number: "Thyme"
    };

    const starting_customer = await execute_api_query(create_new_customer, pack_test(customer_info, test_name));

    if(is_server_error(starting_customer)) {
        fail();
    }

    const name_change_info: CustomerUpdateData = {
        name: "Justin Wong",
        phone_number: null,
        notes: null,
    }

    const name_changed = await execute_api_query(
        update_customer_info, 
        pack_test({ customer: starting_customer, update: name_change_info }, test_name)
    );

    if(is_server_error(name_changed)) {
        fail();
    }

    const name_changed_entry = await pack_test({ id: starting_customer.id }, test_name)
        .bind(retrieve_customer_entry)
        .unpack();

    if(is_successful_query(name_changed_entry)) {
        expect(name_changed_entry.id).toBe(starting_customer.id);
        expect(name_changed_entry.name).toBe(name_change_info.name);
        expect(name_changed_entry.phone_number).toBe(starting_customer.phone_number);
        expect(name_changed_entry.notes).toBe(starting_customer.notes);
    } else {
        fail();
    }
})

test("update customer phone_number", async () => {
    const test_name = test_suit.concat("/customer_phone_number_update/");
   
    const customer_info = {
        name: "Justin Wong",
        phone_number: "Thyme"
    };

    const starting_customer = await execute_api_query(create_new_customer, pack_test(customer_info, test_name));

    if(is_server_error(starting_customer)) {
        fail();
    }

    const phone_change_info: CustomerUpdateData = {
        name: null,
        phone_number: "Evo Monent 37",
        notes: null,
    }

    const phone_changed = await execute_api_query(
        update_customer_info, 
        pack_test({ customer: starting_customer, update: phone_change_info }, test_name)
    );

    if(is_server_error(phone_changed)) {
        fail();
    }

    const phone_changed_entry = await pack_test({ id: starting_customer.id }, test_name)
        .bind(retrieve_customer_entry)
        .unpack();

    if(is_successful_query(phone_changed_entry)) {
        expect(phone_changed_entry.id).toBe(starting_customer.id);
        expect(phone_changed_entry.name).toBe(starting_customer.name);
        expect(phone_changed_entry.phone_number).toBe(phone_change_info.phone_number);
        expect(phone_changed_entry.notes).toBe(starting_customer.notes);
    } else {
        fail();
    }
})

test("update customer notes", async () => {
    const test_name = test_suit.concat("/customer_notes_update/");
   
    const customer_info = {
        name: "Justin Wong",
        phone_number: "Thyme"
    };

    const starting_customer = await execute_api_query(create_new_customer, pack_test(customer_info, test_name));

    if(is_server_error(starting_customer)) {
        fail();
    }

    const notes_change_info: CustomerUpdateData = {
        name: null,
        phone_number: null,
        notes: "Justin Wong"
    }

    const phone_changed = await execute_api_query(
        update_customer_info, 
        pack_test({ customer: starting_customer, update: notes_change_info }, test_name)
    );

    if(is_server_error(phone_changed)) {
        fail();
    }

    const notes_changed_entry = await pack_test({ id: starting_customer.id }, test_name)
        .bind(retrieve_customer_entry)
        .unpack();

    if(is_successful_query(notes_changed_entry)) {
        expect(notes_changed_entry.id).toBe(starting_customer.id);
        expect(notes_changed_entry.name).toBe(starting_customer.name);
        expect(notes_changed_entry.phone_number).toBe(starting_customer.phone_number);
        expect(notes_changed_entry.notes).toBe(notes_change_info.notes);
    } else {
        fail();
    }
})

test("update customer info", async () => {
    const test_name = test_suit.concat("/customer_info_update/");
   
    const customer_info = {
        name: "Justin Wong",
        phone_number: "Thyme"
    };

    const starting_customer = await execute_api_query(create_new_customer, pack_test(customer_info, test_name));

    if(is_server_error(starting_customer)) {
        fail();
    }

    const update_target: CustomerUpdateData = {
        name: "Justin Wong",
        phone_number: "Evo Moment 37",
        notes: "Get Daigo Parried"
    }

    const phone_changed = await execute_api_query(
        update_customer_info, 
        pack_test({ customer: starting_customer, update: update_target }, test_name)
    );

    if(is_server_error(phone_changed)) {
        fail();
    }

    const updated_entry = await pack_test({ id: starting_customer.id }, test_name)
        .bind(retrieve_customer_entry)
        .unpack();

    if(is_successful_query(updated_entry)) {
        expect(updated_entry.id).toBe(starting_customer.id);
        expect(updated_entry.name).toBe(update_target.name);
        expect(updated_entry.phone_number).toBe(update_target.phone_number);
        expect(updated_entry.notes).toBe(update_target.notes);
    } else {
        fail();
    }
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
