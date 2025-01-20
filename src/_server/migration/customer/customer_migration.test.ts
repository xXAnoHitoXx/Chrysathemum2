import { FireDB } from "~/_server/fire_db";
import { ServerQueryData } from "~/_server/server_query";
import {
    create_customer_migration_index,
    delete_customer_migration_index,
    retrieve_customer_id_from_legacy_id,
} from "./migration_index";
import { is_data_error } from "~/_server/generic_query/data_error";
import { wipe_test_data } from "~/_server/test_util";

const test_suit = "customer_migration";

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

test("test customer_migration_index CRUDs querries", async () => {
    const test_name = test_suit + "/test_customer_migration_index_cruds/";
    const test_db = FireDB.test(test_name);

    const test_ids = { id: "BaNaNa", legacy_id: "banana" };

    let conversion = await ServerQueryData.pack(
        { legacy_id: test_ids.legacy_id },
        test_db,
    )
        .bind(retrieve_customer_id_from_legacy_id)
        .unpack();

    if (!is_data_error(conversion)) {
        expect(conversion.customer_id).toBeNull();
    } else {
        fail();
    }

    await ServerQueryData.pack(
        { customer_id: test_ids.id, legacy_id: test_ids.legacy_id },
        test_db,
    )
        .bind(create_customer_migration_index)
        .unpack();

    conversion = await ServerQueryData.pack(
        { legacy_id: test_ids.legacy_id },
        test_db,
    )
        .bind(retrieve_customer_id_from_legacy_id)
        .unpack();

    if (!is_data_error(conversion)) {
        expect(conversion.customer_id).toBe(test_ids.id);
    } else {
        fail();
    }

    await ServerQueryData.pack({ legacy_id: test_ids.legacy_id }, test_db)
        .bind(delete_customer_migration_index)
        .unpack();

    conversion = await ServerQueryData.pack(
        { legacy_id: test_ids.legacy_id },
        test_db,
    )
        .bind(retrieve_customer_id_from_legacy_id)
        .unpack();

    if (!is_data_error(conversion)) {
        expect(conversion.customer_id).toBeNull();
    } else {
        fail();
    }

    await ServerQueryData.pack(test_name, test_db)
        .bind(wipe_test_data)
        .unpack();
});
