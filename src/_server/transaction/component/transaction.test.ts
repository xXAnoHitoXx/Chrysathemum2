import { is_data_error } from "~/_server/data_error";
import { FireDB } from "~/_server/fire_db";
import { wipe_test_data } from "~/_server/test_util";
import { TransactionEntry } from "../type_def";
import {
    create_trasaction_date_entry,
    delete_transaction_date_entry,
    retrieve_transaction_entry,
    update_transaction_date_entry,
} from "./transaction_entry";

const test_suit = "transaction_cruds";

afterAll(async () => {
    const clean_up = await wipe_test_data.call(
        test_suit,
        FireDB.test(test_suit),
    );

    if (is_data_error(clean_up)) {
        clean_up.log();
    }
});

test("test transaction_entries CRUDs querries", async () => {
    const test_name = test_suit + "/test_transaction_date_cruds/";
    const test_db = FireDB.test(test_name);

    const template: TransactionEntry = {
        id: "naiesrntearinsteian",
        customer_id: "Banana",
        technician_id: "arstarsnteiano",
        salon: "5CBL",
        date: "21 12 2023",
        time: 5,
        details: "emotional damage",
        amount: 11500,
        tip: 1725,
        cash: 0,
        gift: 5750,
        discount: 2500,
    };

    const transaction = await create_trasaction_date_entry.call(
        template,
        test_db,
    );

    if (is_data_error(transaction)) {
        transaction.log();
        fail();
    }

    let db_transaction = await retrieve_transaction_entry.call(
        {
            date: template.date,
            entry_id: template.id,
            salon: template.salon,
        },
        test_db,
    );

    if (is_data_error(db_transaction)) {
        db_transaction.log();
        fail();
    }

    expect(db_transaction).toEqual(template);

    const update_target = {
        ...template,
        amount: 10000,
        cash: 2300,
        details: "banana",
    };

    const update_query = await update_transaction_date_entry.call(
        update_target,
        test_db,
    );

    if (is_data_error(update_query)) {
        update_query.log();
        fail();
    }

    db_transaction = await retrieve_transaction_entry.call(
        {
            date: template.date,
            entry_id: template.id,
            salon: template.salon,
        },
        test_db,
    );

    if (is_data_error(db_transaction)) {
        db_transaction.log();
        fail();
    }

    expect(db_transaction).toEqual(update_target);

    const del = await delete_transaction_date_entry.call(
        {
            date: db_transaction.date,
            entry_id: db_transaction.id,
            salon: db_transaction.salon,
        },
        test_db,
    );

    if (is_data_error(del)) {
        del.log();
        fail();
    }

    db_transaction = await retrieve_transaction_entry.call(
        {
            date: template.date,
            entry_id: template.id,
            salon: template.salon,
        },
        test_db,
    );

    expect(is_data_error(db_transaction)).toBe(true);
});
