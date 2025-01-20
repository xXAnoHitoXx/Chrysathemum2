import { FireDB } from "../fire_db";
import { is_data_error } from "../generic_query/data_error";
import { ServerQueryData } from "../server_query";
import { wipe_test_data } from "../test_util";
import { retrieve_customer_entry } from "./components/customer_entry";
import { retrieve_customer_phone_index } from "./components/customer_phone_index";
import { CustomerQuery } from "./customer_queries";

const test_suit = "Customer_Queries";

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

test("customer creation", async () => {
    const test_name = test_suit + "/customer_creation/";
    const test_db = FireDB.test(test_name);

    const customer_info = {
        name: "Justin",
        phone_number: "Thyme",
    };

    const customer = await ServerQueryData.pack(customer_info, test_db)
        .bind(CustomerQuery.create_new_customer)
        .unpack();

    if (is_data_error(customer)) {
        customer.log();
        fail();
    }

    expect(customer.name).toBe(customer_info.name);
    expect(customer.phone_number).toBe(customer_info.phone_number);

    const entry = await ServerQueryData.pack(
        { customer_id: customer.id },
        test_db,
    )
        .bind(retrieve_customer_entry)
        .unpack();

    if (is_data_error(entry)) {
        entry.log();
        fail();
    }

    expect(entry.id).toBe(customer.id);
    expect(entry.name).toBe(customer.name);
    expect(entry.phone_number).toBe(customer.phone_number);

    const index = await ServerQueryData.pack(
        { phone_number: customer.phone_number },
        test_db,
    )
        .bind(retrieve_customer_phone_index)
        .unpack();

    if (is_data_error(index)) {
        index.log();
        fail();
    }

    expect(index).toContain(customer.id);
});
