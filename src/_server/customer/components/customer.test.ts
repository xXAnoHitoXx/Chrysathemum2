import { FireDB } from "~/_server/fire_db";
import { ServerQueryData } from "~/_server/server_query";
import { wipe_test_data } from "~/_server/test_util";
import {
    create_customer_entry,
    delete_customer_entry,
    retrieve_customer_entry,
    update_customer_entry,
} from "./customer_entry";
import { is_data_error } from "~/_server/generic_query/data_error";
import { Customer } from "../type_def";
import {
    create_customer_phone_index,
    delete_customer_phone_index,
    retrieve_customer_phone_index,
} from "./customer_phone_index";

const test_suit = "customers_cruds";

afterAll(async () => {
    const clean_up = await ServerQueryData.pack(
        test_suit,
        FireDB.test(test_suit),
    )
        .bind(wipe_test_data)
        .unpack();

    if (is_data_error(clean_up)) {
        clean_up.log();
    }
});

test("test customer_entries CRUDs querries", async () => {
    const test_name = test_suit + "/test_customer_entries_cruds/";
    const test_db = FireDB.test(test_name);

    const test_customer_entry = await ServerQueryData.pack(
        { name: "Tinn", phone_number: "your mother is a murloc" },
        test_db,
    )
        .bind(create_customer_entry)
        .unpack();

    if (is_data_error(test_customer_entry)) {
        test_customer_entry.log();
        fail();
    }

    const created_customer_entry = await ServerQueryData.pack(
        { customer_id: test_customer_entry.id },
        test_db,
    )
        .bind(retrieve_customer_entry)
        .unpack();

    if (!is_data_error(created_customer_entry)) {
        expect(created_customer_entry.id).toBe(test_customer_entry.id);
        expect(created_customer_entry.name).toBe(test_customer_entry.name);
        expect(created_customer_entry.phone_number).toBe(
            test_customer_entry.phone_number,
        );
    } else {
        created_customer_entry.log();
        fail();
    }

    const update_target: Customer = {
        id: test_customer_entry.id,
        name: "AnoHito",
        phone_number: "your mother is a colosal murloc",
        notes: "is cool",
    };

    await ServerQueryData.pack(update_target, test_db)
        .bind(update_customer_entry)
        .unpack();

    const updated_customer_entry = await ServerQueryData.pack(
        { customer_id: test_customer_entry.id },
        test_db,
    )
        .bind(retrieve_customer_entry)
        .unpack();

    if (!is_data_error(updated_customer_entry)) {
        expect(updated_customer_entry.id).toBe(update_target.id);
        expect(updated_customer_entry.name).toBe(update_target.name);
        expect(updated_customer_entry.phone_number).toBe(
            update_target.phone_number,
        );
        expect(updated_customer_entry.notes).toBe(update_target.notes);
    } else {
        updated_customer_entry.log();
        fail();
    }

    await ServerQueryData.pack({ customer_id: test_customer_entry.id }, test_db)
        .bind(delete_customer_entry)
        .unpack();

    const empty_customer_entry = await ServerQueryData.pack(
        { customer_id: test_customer_entry.id },
        test_db,
    )
        .bind(retrieve_customer_entry)
        .unpack();

    expect(is_data_error(empty_customer_entry)).toBe(true);
});

test("test customer_phone_index CRUDs querries", async () => {
    const test_name = test_suit + "/test_customer_phone_index_cruds/";
    const test_db = FireDB.test(test_name);

    const customer_1: Customer = {
        id: "Banana",
        name: "Pizza",
        phone_number: "Your Mother",
        notes: "",
    };

    const customer_2: Customer = {
        id: "Anana",
        name: "Pineapple",
        phone_number: "Your Mother",
        notes: "",
    };

    let index = await ServerQueryData.pack(
        { phone_number: customer_1.phone_number },
        test_db,
    )
        .bind(retrieve_customer_phone_index)
        .unpack();

    if (is_data_error(index)) {
        index.log();
        fail();
    }

    expect(index).toHaveLength(0);

    await ServerQueryData.pack(customer_1, test_db)
        .bind(create_customer_phone_index)
        .unpack();

    await ServerQueryData.pack(customer_2, test_db)
        .bind(create_customer_phone_index)
        .unpack();

    index = await ServerQueryData.pack(
        { phone_number: customer_1.phone_number },
        test_db,
    )
        .bind(retrieve_customer_phone_index)
        .unpack();

    if (is_data_error(index)) {
        index.log();
        fail();
    }

    expect(index).toHaveLength(2);
    expect(index).toContain(customer_1.id);
    expect(index).toContain(customer_2.id);

    await ServerQueryData.pack(customer_1, test_db)
        .bind(delete_customer_phone_index)
        .unpack();

    index = await ServerQueryData.pack(
        { phone_number: customer_1.phone_number },
        test_db,
    )
        .bind(retrieve_customer_phone_index)
        .unpack();

    if (is_data_error(index)) {
        index.log();
        fail();
    }

    expect(index).toHaveLength(1);
    expect(index).not.toContain(customer_1.id);
    expect(index).toContain(customer_2.id);
});
