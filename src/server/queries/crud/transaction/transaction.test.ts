import { clear_test_data } from "~/server/db_schema/fb_schema";
import { pack_test } from "../../server_queries_monad";
import { create_trasaction_date_entry, delete_transaction_date_entry, retrieve_transaction_entry, retrieve_transactions_on_date, update_transaction_date_entry } from "./transaction_date_entry";
import { extract_error, is_data_error } from "~/server/data_error";
import { TransactionEntry } from "~/server/db_schema/type_def";
import { create_customer_trasaction_history_entry, delete_customers_transaction_history_entry, retrieve_customer_transactions_history } from "./customer_transaction_entry";

const test_suit = "transaction_cruds";

afterAll(async () => {
    await clear_test_data(test_suit);
})

test("test transaction_entries CRUDs querries", async () => {
    const test_name = test_suit.concat("/test_transaction_date_cruds/");
    
    const template: TransactionEntry = {
        id: "naiesrntearinsteian",
        customer_id: "Banana",
        technician_id: "arstarsnteiano",
        salon: "5CBL",
        date: 10870,
        time: 5,
        details: "emotional damage",
        amount: 11500,
        tip: 1725,
        cash: 0,
        gift: 5750,
        discount: 2500,
    }

    const transaction = await pack_test(template, test_name
    ).bind(create_trasaction_date_entry).unpack();

    if(is_data_error(transaction)) {
        transaction.log();
        fail();
    }

    let db_transaction = await pack_test({ date: template.date.toString(), id: template.id }, test_name)
        .bind(retrieve_transaction_entry).unpack();

    if(is_data_error(db_transaction)) {
        db_transaction.log();
        fail();
    }


    expect(db_transaction.id).toBe(template.id);
    expect(db_transaction.customer_id).toBe(template.customer_id);
    expect(db_transaction.technician_id).toBe(template.technician_id);
    expect(db_transaction.date).toBe(template.date);
    expect(db_transaction.time).toBe(template.time);
    expect(db_transaction.details).toBe(template.details);
    expect(db_transaction.amount).toBe(template.amount);
    expect(db_transaction.tip).toBe(template.tip);
    expect(db_transaction.cash).toBe(template.cash);
    expect(db_transaction.gift).toBe(template.gift);
    expect(db_transaction.discount).toBe(template.discount);

    const update_target = {
        ...template,
        amount: 10000,
        cash: 2300,
        details: "banana",
    }

    const update_query = await pack_test(update_target, test_name)
        .bind(update_transaction_date_entry).unpack();

    if(is_data_error(update_query)) {
        update_query.log()
        fail();
    }

    db_transaction = await pack_test({ date: template.date.toString(), id: template.id }, test_name)
        .bind(retrieve_transaction_entry).unpack();

    if(is_data_error(db_transaction)) {
        db_transaction.log();
        fail();
    }

    expect(db_transaction.id).toBe(update_target.id);
    expect(db_transaction.customer_id).toBe(update_target.customer_id);
    expect(db_transaction.technician_id).toBe(update_target.technician_id);
    expect(db_transaction.date).toBe(update_target.date);
    expect(db_transaction.time).toBe(update_target.time);
    expect(db_transaction.details).toBe(update_target.details);
    expect(db_transaction.amount).toBe(update_target.amount);
    expect(db_transaction.tip).toBe(update_target.tip);
    expect(db_transaction.cash).toBe(update_target.cash);
    expect(db_transaction.gift).toBe(update_target.gift);
    expect(db_transaction.discount).toBe(update_target.discount);

    const del = await pack_test({ date: db_transaction.date.toString(), id: db_transaction.id }, test_name)
        .bind(delete_transaction_date_entry).unpack();

    if(is_data_error(del)) {
        del.log();
        fail();
    }

    db_transaction = await pack_test({ date: template.date.toString(), id: template.id }, test_name)
        .bind(retrieve_transaction_entry).unpack();

    if(!is_data_error(db_transaction)) {
        fail();
    }
});

test("test retrieve transactions on date querries", async () => {
    const test_name = test_suit.concat("/test_ret_transactions_entry_on_date/");

    const t1: TransactionEntry = {
        id: "naiesrntearinsteian",
        customer_id: "Banana",
        technician_id: "arstarsnteiano",
        salon: "5CBL",
        date: 10870,
        time: 5,
        details: "emotional damage",
        amount: 11500,
        tip: 1725,
        cash: 0,
        gift: 5750,
        discount: 2500,
    }

    const t2: TransactionEntry = {
        id: "asrontaensr",
        customer_id: "Banono",
        technician_id: "arstarsnteiano",
        salon: "5CBL",
        date: 11560,
        time: 5,
        details: "emotional damage",
        amount: 11500,
        tip: 1725,
        cash: 0,
        gift: 5750,
        discount: 2500,
    }

    const t3: TransactionEntry = {
        id: "rstoaaoesnt",
        customer_id: "Banunu",
        technician_id: "arstarsnteiano",
        salon: "5CBL",
        date: 10870,
        time: 5,
        details: "emotional damage",
        amount: 11500,
        tip: 1725,
        cash: 0,
        gift: 5750,
        discount: 2500,
    }

    const blank = await pack_test({date: t1.date.toString()}, test_name)
        .bind(retrieve_transactions_on_date).bind(extract_error((error) => {
            error.log();
            fail();
        })).unpack();

    if(is_data_error(blank)) {
        blank.log();
        fail();
    }

    expect(blank.length).toBe(0);

    const ct1 = await pack_test(t1, test_name).bind(create_trasaction_date_entry).unpack();
    const ct2 = await pack_test(t2, test_name).bind(create_trasaction_date_entry).unpack();

    if(is_data_error(ct1)) {
        ct1.log();
        fail();
    }

    if(is_data_error(ct2)) {
        ct2.log();
        fail();
    }

    let transactions = await pack_test({date: t1.date.toString()}, test_name)
        .bind(retrieve_transactions_on_date).bind(extract_error((error) => {
            error.log();
            fail();
        })).unpack();

    if(is_data_error(transactions)) {
        transactions.log();
        fail();
    }

    expect(transactions.length).toBe(1);
    expect(transactions[0]?.id).toBe(t1.id);
    expect(transactions[0]?.customer_id).toBe(t1.customer_id);
    expect(transactions[0]?.technician_id).toBe(t1.technician_id);
    expect(transactions[0]?.salon).toBe(t1.salon);
    expect(transactions[0]?.date).toBe(t1.date);
    expect(transactions[0]?.time).toBe(t1.time);
    expect(transactions[0]?.details).toBe(t1.details);
    expect(transactions[0]?.amount).toBe(t1.amount);
    expect(transactions[0]?.tip).toBe(t1.tip);
    expect(transactions[0]?.cash).toBe(t1.cash);
    expect(transactions[0]?.gift).toBe(t1.gift);
    expect(transactions[0]?.discount).toBe(t1.discount);

    const ct3 = await pack_test(t3, test_name).bind(create_trasaction_date_entry).unpack();

    if(is_data_error(ct3)) {
        ct3.log();
        fail();
    }

    transactions = await pack_test({date: t1.date.toString()}, test_name)
        .bind(retrieve_transactions_on_date).bind(extract_error((error) => {
            error.log();
            fail();
        })).unpack();

    if(is_data_error(transactions)) {
        transactions.log();
        fail();
    }

    expect(transactions.length).toBe(2);

    expect(transactions[0]?.id).toBe(t1.id);
    expect(transactions[0]?.customer_id).toBe(t1.customer_id);
    expect(transactions[0]?.technician_id).toBe(t1.technician_id);
    expect(transactions[0]?.salon).toBe(t1.salon);
    expect(transactions[0]?.date).toBe(t1.date);
    expect(transactions[0]?.time).toBe(t1.time);
    expect(transactions[0]?.details).toBe(t1.details);
    expect(transactions[0]?.amount).toBe(t1.amount);
    expect(transactions[0]?.tip).toBe(t1.tip);
    expect(transactions[0]?.cash).toBe(t1.cash);
    expect(transactions[0]?.gift).toBe(t1.gift);
    expect(transactions[0]?.discount).toBe(t1.discount);

    expect(transactions[1]?.id).toBe(t3.id);
    expect(transactions[1]?.customer_id).toBe(t3.customer_id);
    expect(transactions[1]?.technician_id).toBe(t3.technician_id);
    expect(transactions[1]?.salon).toBe(t3.salon);
    expect(transactions[1]?.date).toBe(t3.date);
    expect(transactions[1]?.time).toBe(t3.time);
    expect(transactions[1]?.details).toBe(t3.details);
    expect(transactions[1]?.amount).toBe(t3.amount);
    expect(transactions[1]?.tip).toBe(t3.tip);
    expect(transactions[1]?.cash).toBe(t3.cash);
    expect(transactions[1]?.gift).toBe(t3.gift);
    expect(transactions[1]?.discount).toBe(t3.discount);
    
    const del = await pack_test({id: t1.id, date: t1.date.toString()}, test_name)
        .bind(delete_transaction_date_entry).unpack();
    
    if(is_data_error(del)) {
        del.log();
        fail();
    }

    transactions = await pack_test({date: t1.date.toString()}, test_name)
        .bind(retrieve_transactions_on_date).bind(extract_error((error) => {
            error.log();
            fail();
        })).unpack();

    if(is_data_error(transactions)) {
        transactions.log();
        fail();
    }

    expect(transactions.length).toBe(1);

    expect(transactions[0]?.id).toBe(t3.id);
    expect(transactions[0]?.customer_id).toBe(t3.customer_id);
    expect(transactions[0]?.technician_id).toBe(t3.technician_id);
    expect(transactions[0]?.salon).toBe(t3.salon);
    expect(transactions[0]?.date).toBe(t3.date);
    expect(transactions[0]?.time).toBe(t3.time);
    expect(transactions[0]?.details).toBe(t3.details);
    expect(transactions[0]?.amount).toBe(t3.amount);
    expect(transactions[0]?.tip).toBe(t3.tip);
    expect(transactions[0]?.cash).toBe(t3.cash);
    expect(transactions[0]?.gift).toBe(t3.gift);
    expect(transactions[0]?.discount).toBe(t3.discount);
});

test("test customer transaction history entries CRUDs querries", async () => {
    const test_name = test_suit.concat("/test_transaction_history_cruds/");

    const history = {
        customer_id: "bruh",
        id: "q;wyfupl",
        date: "20 2 2085"
    }

    const create = await pack_test(history, test_name)
        .bind(create_customer_trasaction_history_entry).unpack();

    if(is_data_error(create)){
        create.log();
        fail();
    }

    let customer_history = await pack_test({ customer_id: history.customer_id }, test_name)
        .bind(retrieve_customer_transactions_history).unpack();

    if(is_data_error(customer_history)){
        customer_history.log();
        fail();
    }

    if(is_data_error(customer_history.error)) {
        customer_history.error.log();
        fail();
    }

    expect(customer_history.data.length).toBe(1);
    expect(customer_history.data[0]).not.toBeUndefined();
    expect(customer_history.data[0]?.id).toBe(history.id);
    expect(customer_history.data[0]?.date).toBe(history.date);

    const del = await pack_test({ customer_id: history.customer_id, id: history.id }, test_name)
        .bind(delete_customers_transaction_history_entry).unpack();

    if(is_data_error(del)) {
        del.log();
        fail();
    }

    customer_history = await pack_test({ customer_id: history.customer_id }, test_name)
        .bind(retrieve_customer_transactions_history).unpack();

    if(is_data_error(customer_history)){
        customer_history.log();
        fail();
    }

    if(is_data_error(customer_history.error)) {
        customer_history.error.log();
        fail();
    }

    expect(customer_history.data.length).toBe(0);
});
