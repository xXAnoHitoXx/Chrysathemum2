import { clear_test_data } from "~/server/db_schema/fb_schema";
import type { Customer, CustomerUpdateData } from "~/server/db_schema/type_def";
import {
    create_new_customer,
    is_no_book,
    update_customer_info,
} from "./customer_queries";
import { retrieve_customer_entry } from "~/server/queries/crud/customer/customer_entry";
import { retrieve_customer_phone_index } from "~/server/queries/crud/customer/customer_phone_index";
import { pack_test } from "~/server/queries/server_queries_monad";
import { is_data_error } from "~/server/data_error";

const test_suit = "customer_business_logic";

afterAll(async () => {
    await clear_test_data(test_suit);
});

test("customer creation", async () => {
    const test_name = test_suit.concat("/customer_creation/");

    const customer_info = {
        name: "Justin",
        phone_number: "Thyme",
    };

    const customer = await pack_test(customer_info, test_name)
        .bind(create_new_customer)
        .unpack();

    if (is_data_error(customer)) {
        customer.log();
        fail();
    }

    expect(customer.name).toBe(customer_info.name);
    expect(customer.phone_number).toBe(customer_info.phone_number);

    const entry = await pack_test({ customer_id: customer.id }, test_name)
        .bind(retrieve_customer_entry)
        .unpack();

    if (is_data_error(entry)) {
        entry.log();
        fail();
    }

    expect(entry.id).toBe(customer.id);
    expect(entry.name).toBe(customer.name);
    expect(entry.phone_number).toBe(customer.phone_number);

    const index = await pack_test(
        { phone_number: customer.phone_number },
        test_name,
    )
        .bind(retrieve_customer_phone_index)
        .unpack();

    if (is_data_error(index)) {
        index.log();
        fail();
    }

    expect(index.error).toBeNull();
    expect(index.data.customer_ids).toContain(customer.id);
});

test("update customer name", async () => {
    const test_name = test_suit.concat("/customer_name_update/");

    const customer_info = {
        name: "Justin",
        phone_number: "Thyme",
    };

    const starting_customer = await pack_test(customer_info, test_name)
        .bind(create_new_customer)
        .unpack();

    if (is_data_error(starting_customer)) {
        starting_customer.log();
        fail();
    }

    const name_change_info: CustomerUpdateData = {
        name: "Justin Wong",
        phone_number: starting_customer.phone_number,
        notes: starting_customer.notes,
    };

    const name_changed = await pack_test(
        { customer: starting_customer, update: name_change_info },
        test_name,
    )
        .bind(update_customer_info)
        .unpack();

    if (is_data_error(name_changed)) {
        name_changed.log();
        fail();
    }

    const name_changed_entry = await pack_test(
        { customer_id: starting_customer.id },
        test_name,
    )
        .bind(retrieve_customer_entry)
        .unpack();

    if (is_data_error(name_changed_entry)) {
        name_changed_entry.log();
        fail();
    }

    expect(name_changed_entry.id).toBe(starting_customer.id);
    expect(name_changed_entry.name).toBe(name_change_info.name);
    expect(name_changed_entry.phone_number).toBe(
        starting_customer.phone_number,
    );
    expect(name_changed_entry.notes).toBe(starting_customer.notes);
});

test("update customer phone_number", async () => {
    const test_name = test_suit.concat("/customer_phone_number_update/");

    const customer_info = {
        name: "Justin Wong",
        phone_number: "Thyme",
    };

    const starting_customer = await pack_test(customer_info, test_name)
        .bind(create_new_customer)
        .unpack();

    if (is_data_error(starting_customer)) {
        starting_customer.log();
        fail();
    }

    const phone_change_info: CustomerUpdateData = {
        name: starting_customer.name,
        phone_number: "Evo Monent 37",
        notes: starting_customer.notes,
    };

    const phone_changed = await pack_test(
        { customer: starting_customer, update: phone_change_info },
        test_name,
    )
        .bind(update_customer_info)
        .unpack();

    if (is_data_error(phone_changed)) {
        phone_changed.log();
        fail();
    }

    const phone_changed_entry = await pack_test(
        { customer_id: starting_customer.id },
        test_name,
    )
        .bind(retrieve_customer_entry)
        .unpack();

    if (is_data_error(phone_changed_entry)) {
        phone_changed_entry.log();
        fail();
    }

    expect(phone_changed_entry.id).toBe(starting_customer.id);
    expect(phone_changed_entry.name).toBe(starting_customer.name);
    expect(phone_changed_entry.phone_number).toBe(
        phone_change_info.phone_number,
    );
    expect(phone_changed_entry.notes).toBe(starting_customer.notes);
});

test("update customer notes", async () => {
    const test_name = test_suit.concat("/customer_notes_update/");

    const customer_info = {
        name: "Justin Wong",
        phone_number: "Thyme",
    };

    const starting_customer = await pack_test(customer_info, test_name)
        .bind(create_new_customer)
        .unpack();

    if (is_data_error(starting_customer)) {
        starting_customer.log();
        fail();
    }

    const notes_change_info: CustomerUpdateData = {
        name: starting_customer.name,
        phone_number: starting_customer.phone_number,
        notes: "Justin Wong",
    };

    const phone_changed = await pack_test(
        { customer: starting_customer, update: notes_change_info },
        test_name,
    )
        .bind(update_customer_info)
        .unpack();

    if (is_data_error(phone_changed)) {
        phone_changed.log();
        fail();
    }

    const notes_changed_entry = await pack_test(
        { customer_id: starting_customer.id },
        test_name,
    )
        .bind(retrieve_customer_entry)
        .unpack();

    if (is_data_error(notes_changed_entry)) {
        notes_changed_entry.log();
        fail();
    }

    if (is_data_error(notes_changed_entry)) {
        notes_changed_entry.log();
        fail();
    }

    expect(notes_changed_entry.id).toBe(starting_customer.id);
    expect(notes_changed_entry.name).toBe(starting_customer.name);
    expect(notes_changed_entry.phone_number).toBe(
        starting_customer.phone_number,
    );
    expect(notes_changed_entry.notes).toBe(notes_change_info.notes);
});

test("update customer info", async () => {
    const test_name = test_suit.concat("/customer_info_update/");

    const customer_info = {
        name: "Justin Wong",
        phone_number: "Thyme",
    };

    const starting_customer = await pack_test(customer_info, test_name)
        .bind(create_new_customer)
        .unpack();

    if (is_data_error(starting_customer)) {
        starting_customer.log();
        fail();
    }

    const update_target: CustomerUpdateData = {
        name: "Justin Wong",
        phone_number: "Evo Moment 37",
        notes: "Get Daigo Parried",
    };

    const phone_changed = await pack_test(
        { customer: starting_customer, update: update_target },
        test_name,
    )
        .bind(update_customer_info)
        .unpack();

    if (is_data_error(phone_changed)) {
        phone_changed.log();
        fail();
    }

    const updated_entry = await pack_test(
        { customer_id: starting_customer.id },
        test_name,
    )
        .bind(retrieve_customer_entry)
        .unpack();

    if (is_data_error(updated_entry)) {
        updated_entry.log();
        fail();
    }

    expect(updated_entry.id).toBe(starting_customer.id);
    expect(updated_entry.name).toBe(update_target.name);
    expect(updated_entry.phone_number).toBe(update_target.phone_number);
    expect(updated_entry.notes).toBe(update_target.notes);
});

test("check for no book flag", () => {
    const customer: Customer = {
        id: "JWong",
        name: "Justin Wong",
        phone_number: "Evo Moment 37",
        notes: "Get Daigo Parried",
    };

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
});
