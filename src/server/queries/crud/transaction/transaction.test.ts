import { clear_test_data } from "~/server/db_schema/fb_schema";
import { pack_test } from "../../server_queries_monad";
import { create_trasaction_date_entry, delete_transaction_date_entry, retrieve_transactions_on_date, update_transaction_date_entry } from "./transaction_date_entry";
import { is_data_error } from "~/server/data_error";
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

    let db_transactions = await pack_test({ date: template.date.toString() }, test_name)
        .bind(retrieve_transactions_on_date).unpack();

    if(is_data_error(db_transactions)) {
        db_transactions.log();
        fail();
    }

    if(db_transactions.error != null){
        db_transactions.error.log();
        fail();
    }

    expect(db_transactions.data.length).toBe(1);

    let db_transaction: TransactionEntry | undefined = db_transactions.data[0];
    if(db_transaction == null){
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

    db_transactions = await pack_test({ date: template.date.toString() }, test_name)
        .bind(retrieve_transactions_on_date).unpack();

    if(is_data_error(db_transactions)) {
        db_transactions.log();
        fail();
    }

    expect(db_transactions.data.length).toBe(1);
    if(db_transactions.error != null){
        db_transactions.error.log();
        fail();
    }

    db_transaction = db_transactions.data[0];
    if(db_transaction == null){
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

    db_transactions = await pack_test({ date: template.date.toString() }, test_name)
        .bind(retrieve_transactions_on_date).unpack();

    if(is_data_error(db_transactions)) {
        db_transactions.log();
        fail();
    }

    if(db_transactions.error != null){
        db_transactions.error.log();
        fail();
    }

    expect(db_transactions.data.length).toBe(0);
});

test("test customer transaction history entries CRUDs querries", async () => {
    const test_name = test_suit.concat("/test_transaction_date_cruds/");

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
