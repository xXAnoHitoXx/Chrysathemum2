import { is_data_error } from "~/server/data_error";
import { FireDB } from "~/server/fire_db";
import { wipe_test_data } from "~/server/test_util";
import { TransactionEntry } from "../type_def";
import {
    create_trasaction_date_entry,
    delete_transaction_date_entry,
    retrieve_transaction_entries_on_date,
    retrieve_transaction_entry,
    update_transaction_date_entry,
} from "./transaction_entry";
import {
    create_customer_trasaction_history_entry,
    delete_customers_transaction_history_entry,
    retrieve_customer_transactions_history,
} from "./customer_history";

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
        date: "2023-12-21",
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

test("test retrieve transactions on date querries", async () => {
    const test_name = test_suit + "/test_ret_transactions_entry_on_date/";
    const test_db = FireDB.test(test_name);

    const t1: TransactionEntry = {
        id: "naiesrntearinsteian",
        customer_id: "Banana",
        technician_id: "arstarsnteiano",
        salon: "5CBL",
        date: "2021-07-14",
        time: 5,
        details: "emotional damage",
        amount: 11500,
        tip: 1725,
        cash: 0,
        gift: 5750,
        discount: 2500,
    };

    const t2: TransactionEntry = {
        id: "asrontaensr",
        customer_id: "Banono",
        technician_id: "arstarsnteiano",
        salon: "5CBL",
        date: "2021-03-21",
        time: 5,
        details: "emotional damage",
        amount: 11500,
        tip: 1725,
        cash: 0,
        gift: 5750,
        discount: 2500,
    };

    const t3: TransactionEntry = {
        id: "rstoaaoesnt",
        customer_id: "Banunu",
        technician_id: "arstarsnteiano",
        salon: "5CBL",
        date: "2021-07-14",
        time: 5,
        details: "emotional damage",
        amount: 11500,
        tip: 1725,
        cash: 0,
        gift: 5750,
        discount: 2500,
    };

    const blank = await retrieve_transaction_entries_on_date.call(
        { date: t1.date, salon: t1.salon },
        test_db,
    );

    if (is_data_error(blank)) {
        blank.log();
        fail();
    }

    expect(blank).toHaveLength(0);

    const ct1 = await create_trasaction_date_entry.call(t1, test_db);
    const ct2 = await create_trasaction_date_entry.call(t2, test_db);

    if (is_data_error(ct1)) {
        ct1.log();
        fail();
    }

    if (is_data_error(ct2)) {
        ct2.log();
        fail();
    }

    let transactions = await retrieve_transaction_entries_on_date.call(
        { date: t1.date, salon: t1.salon },
        test_db,
    );

    if (is_data_error(transactions)) {
        transactions.log();
        fail();
    }

    expect(transactions).toHaveLength(1);

    expect(transactions).not.toContainEqual(t2);
    expect(transactions).toContainEqual(t1);

    const ct3 = await create_trasaction_date_entry.call(t3, test_db);

    if (is_data_error(ct3)) {
        ct3.log();
        fail();
    }

    transactions = await retrieve_transaction_entries_on_date.call(
        { date: t1.date, salon: t1.salon },
        test_db,
    );

    if (is_data_error(transactions)) {
        transactions.log();
        fail();
    }

    expect(transactions).toHaveLength(2);

    expect(transactions).not.toContainEqual(t2);
    expect(transactions).toContainEqual(t1);
    expect(transactions).toContainEqual(t3);

    const del = await delete_transaction_date_entry.call(
        { entry_id: t1.id, date: t1.date, salon: t1.salon },
        test_db,
    );

    if (is_data_error(del)) {
        del.log();
        fail();
    }

    transactions = await retrieve_transaction_entries_on_date.call(
        { date: t1.date, salon: t1.salon },
        test_db,
    );

    if (is_data_error(transactions)) {
        transactions.log();
        fail();
    }

    expect(transactions).toHaveLength(1);

    expect(transactions).not.toContainEqual(t2);
    expect(transactions).not.toContainEqual(t1);
    expect(transactions).toContainEqual(t3);
});

test("test customer transaction history entries CRUDs querries", async () => {
    const test_name = test_suit + "/test_transaction_history_cruds/";
    const test_db = FireDB.test(test_name);

    const history = {
        customer_id: "bruh",
        transaction_id: "q;wyfupl",
        date: "2085-02-20",
        salon: "SCVL",
    };

    const create = await create_customer_trasaction_history_entry.call(
        history,
        test_db,
    );

    if (is_data_error(create)) {
        create.log();
        fail();
    }

    let customer_history = await retrieve_customer_transactions_history.call(
        { customer_id: history.customer_id },
        test_db,
    );

    if (is_data_error(customer_history)) {
        customer_history.log();
        fail();
    }

    expect(customer_history).toHaveLength(1);
    expect(customer_history).toContainEqual(history);

    const del = await delete_customers_transaction_history_entry.call(
        history,
        test_db,
    );

    if (is_data_error(del)) {
        del.log();
        fail();
    }

    customer_history = await retrieve_customer_transactions_history.call(
        { customer_id: history.customer_id },
        test_db,
    );

    if (is_data_error(customer_history)) {
        customer_history.log();
        fail();
    }

    expect(customer_history).toHaveLength(0);
});
