import { FireDB } from "~/server/fire_db";
import {
    create_customer_migration_index,
    delete_customer_migration_index,
    retrieve_customer_id_from_legacy_id,
} from "./migration_index";
import { is_data_error } from "~/server/data_error";
import { wipe_test_data } from "~/server/test_util";

const test_suit = "customer_migration";

afterAll(async () => {
    const clean_up = await wipe_test_data.call(
        test_suit,
        FireDB.test(test_suit),
    );

    if (is_data_error(clean_up)) {
        clean_up.log();
    }
});

test("test customer_migration_index CRUDs querries", async () => {
    const test_name = test_suit + "/test_customer_migration_index_cruds/";
    const test_db = FireDB.test(test_name);

    const test_ids = { id: "BaNaNa", legacy_id: "banana" };

    let conversion = await retrieve_customer_id_from_legacy_id.call(
        { legacy_id: test_ids.legacy_id },
        test_db,
    );

    if (is_data_error(conversion)) {
        conversion.log();
        fail();
    }
    expect(conversion.customer_id).toBeNull();

    await create_customer_migration_index.call(
        { customer_id: test_ids.id, legacy_id: test_ids.legacy_id },
        test_db,
    );

    conversion = await retrieve_customer_id_from_legacy_id.call(
        { legacy_id: test_ids.legacy_id },
        test_db,
    );

    if (is_data_error(conversion)) {
        conversion.log();
        fail();
    }
    expect(conversion.customer_id).toBe(test_ids.id);

    await delete_customer_migration_index.call(
        { legacy_id: test_ids.legacy_id },
        test_db,
    );

    conversion = await retrieve_customer_id_from_legacy_id.call(
        { legacy_id: test_ids.legacy_id },
        test_db,
    );

    if (is_data_error(conversion)) {
        conversion.log();
        fail();
    }
    expect(conversion.customer_id).toBeNull();
});
