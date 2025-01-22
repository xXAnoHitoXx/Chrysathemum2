import { is_data_error } from "../data_error";
import { FireDB } from "../fire_db";
import { wipe_test_data } from "../test_util";
import { retrieve_customer_entry } from "./components/customer_entry";
import { retrieve_customer_phone_index } from "./components/customer_phone_index";
import { CustomerQuery } from "./customer_queries";
import { CustomerUpdateData } from "./type_def";

const test_suit = "Customer_Queries";

afterAll(async () => {
    const clean_up = await wipe_test_data.call(
        test_suit,
        FireDB.test(test_suit),
    );

    if (is_data_error(clean_up)) {
        clean_up.log();
    }
});

test("customer creation", async () => {
    const test_name = test_suit + "/customer_creation/";
    const test_db = FireDB.test(test_name);

    const customer_info = {
        name: "Justin",
        phone_number: "Thyme",
    };

    const customer = await CustomerQuery.create_new_customer.call(
        customer_info,
        test_db,
    );

    if (is_data_error(customer)) {
        customer.log();
        fail();
    }

    expect(customer.name).toBe(customer_info.name);
    expect(customer.phone_number).toBe(customer_info.phone_number);

    const entry = await retrieve_customer_entry.call(
        { customer_id: customer.id },
        test_db,
    );

    if (is_data_error(entry)) {
        entry.log();
        fail();
    }

    expect(entry.id).toBe(customer.id);
    expect(entry.name).toBe(customer.name);
    expect(entry.phone_number).toBe(customer.phone_number);

    const index = await retrieve_customer_phone_index.call(
        { phone_search: customer.phone_number },
        test_db,
    );

    if (is_data_error(index)) {
        index.log();
        fail();
    }

    expect(index).toContain(customer.id);
});

test("update customer name", async () => {
    const test_name = test_suit + "/customer_name_update/";
    const test_db = FireDB.test(test_name);

    const customer_info = {
        name: "Justin",
        phone_number: "Thyme",
    };

    const starting_customer = await CustomerQuery.create_new_customer.call(
        customer_info,
        test_db,
    );

    if (is_data_error(starting_customer)) {
        starting_customer.log();
        fail();
    }

    const name_change_info: CustomerUpdateData = {
        name: "Justin Wong",
        phone_number: starting_customer.phone_number,
        notes: starting_customer.notes,
    };

    const name_changed = await CustomerQuery.update_customer_info.call(
        { customer: starting_customer, update: name_change_info },
        test_db,
    );

    if (is_data_error(name_changed)) {
        name_changed.log();
        fail();
    }

    const name_changed_entry = await retrieve_customer_entry.call(
        { customer_id: starting_customer.id },
        test_db,
    );

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
    const test_name = test_suit + "/customer_phone_number_update/";
    const test_db = FireDB.test(test_name);

    const customer_info = {
        name: "Justin Wong",
        phone_number: "Thyme",
    };

    const starting_customer = await CustomerQuery.create_new_customer.call(
        customer_info,
        test_db,
    );

    if (is_data_error(starting_customer)) {
        starting_customer.log();
        fail();
    }

    const phone_change_info: CustomerUpdateData = {
        name: starting_customer.name,
        phone_number: "Evo Monent 37",
        notes: starting_customer.notes,
    };

    const phone_changed = await CustomerQuery.update_customer_info.call(
        { customer: starting_customer, update: phone_change_info },
        test_db,
    );

    if (is_data_error(phone_changed)) {
        phone_changed.log();
        fail();
    }

    const phone_changed_entry = await retrieve_customer_entry.call(
        { customer_id: starting_customer.id },
        test_db,
    );

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
    const test_name = test_suit + "/customer_notes_update/";
    const test_db = FireDB.test(test_name);

    const customer_info = {
        name: "Justin Wong",
        phone_number: "Thyme",
    };

    const starting_customer = await CustomerQuery.create_new_customer.call(
        customer_info,
        test_db,
    );

    if (is_data_error(starting_customer)) {
        starting_customer.log();
        fail();
    }

    const notes_change_info: CustomerUpdateData = {
        name: starting_customer.name,
        phone_number: starting_customer.phone_number,
        notes: "Justin Wong",
    };

    const phone_changed = await CustomerQuery.update_customer_info.call(
        { customer: starting_customer, update: notes_change_info },
        test_db,
    );

    if (is_data_error(phone_changed)) {
        phone_changed.log();
        fail();
    }

    const notes_changed_entry = await retrieve_customer_entry.call(
        { customer_id: starting_customer.id },
        test_db,
    );

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
    const test_name = test_suit + "/customer_info_update/";
    const test_db = FireDB.test(test_name);

    const customer_info = {
        name: "Justin Wong",
        phone_number: "Thyme",
    };

    const starting_customer = await CustomerQuery.create_new_customer.call(
        customer_info,
        test_db,
    );

    if (is_data_error(starting_customer)) {
        starting_customer.log();
        fail();
    }

    const update_target: CustomerUpdateData = {
        name: "Justin Wong",
        phone_number: "Evo Moment 37",
        notes: "Get Daigo Parried",
    };

    const phone_changed = await CustomerQuery.update_customer_info.call(
        { customer: starting_customer, update: update_target },
        test_db,
    );

    if (is_data_error(phone_changed)) {
        phone_changed.log();
        fail();
    }

    const updated_entry = await retrieve_customer_entry.call(
        { customer_id: starting_customer.id },
        test_db,
    );

    if (is_data_error(updated_entry)) {
        updated_entry.log();
        fail();
    }

    expect(updated_entry.id).toBe(starting_customer.id);
    expect(updated_entry.name).toBe(update_target.name);
    expect(updated_entry.phone_number).toBe(update_target.phone_number);
    expect(updated_entry.notes).toBe(update_target.notes);
});
