import { clear_test_data } from "~/server/db_schema/fb_schema";
import { Account } from "~/server/db_schema/type_def";
import { pack_test } from "../../server_queries_monad";
import { register_earnings, retrieve_earnings, shop_earnings } from "./earning";
import { DataError, is_data_error } from "~/server/data_error";

const test_suit = "accounting_cruds";

afterAll(async () => {
    await clear_test_data(test_suit);
});

test("test accounting cruds CRUDs querries", async () => {
    const test_name = test_suit.concat("/earnings_cruds/");

    const account: Account = {
        amount: 11500,
        tip: 1725,
    };

    const target = {
        entity: "your mom",
        date: "today",
    };

    const blank = await pack_test(target, test_name)
        .bind(retrieve_earnings)
        .unpack();

    if (is_data_error(blank)) {
        blank.log();
        fail();
    }

    expect(blank.amount).toBe(0);
    expect(blank.tip).toBe(0);

    const blank_shop = await pack_test(
        { entity: shop_earnings, date: target.date },
        test_name,
    )
        .bind(retrieve_earnings)
        .unpack();

    if (is_data_error(blank_shop)) {
        blank_shop.log();
        fail();
    }

    expect(blank_shop.amount).toBe(0);
    expect(blank_shop.tip).toBe(0);

    const reg = await pack_test({ ...target, account: account }, test_name)
        .bind(register_earnings)
        .unpack();

    if (is_data_error(reg)) {
        reg.log();
        fail();
    }

    const tarjet = await pack_test(target, test_name)
        .bind(retrieve_earnings)
        .unpack();

    if (is_data_error(tarjet)) {
        tarjet.log();
        fail();
    }

    expect(tarjet.amount).toBe(account.amount);
    expect(tarjet.tip).toBe(account.tip);

    const tarjet_shop = await pack_test(
        { entity: shop_earnings, date: target.date },
        test_name,
    )
        .bind(retrieve_earnings)
        .unpack();

    if (is_data_error(tarjet_shop)) {
        tarjet_shop.log();
        fail();
    }

    expect(tarjet_shop.amount).toBe(account.amount);
    expect(tarjet_shop.tip).toBe(account.tip);
});

test("test concurrent accounting cruds CRUDs querries", async () => {
    const test_name = test_suit.concat("/concurent_earnings_cruds/");

    const account: Account = {
        amount: 2,
        tip: 1,
    };

    const expected: Account = {
        amount: 200,
        tip: 100,
    };
    const target = {
        entity: "your mom",
        date: "today",
    };

    const promises: Promise<void | DataError>[] = [];

    for (let i = 0; i < 100; i++) {
        promises.push(
            pack_test({ ...target, account: account }, test_name)
                .bind(register_earnings)
                .unpack(),
        );
    }

    const result = await Promise.all(promises);

    result.forEach((e) => {
        if (is_data_error(e)) {
            e.log();
            fail();
        }
    });

    const tarjet = await pack_test(target, test_name)
        .bind(retrieve_earnings)
        .unpack();

    if (is_data_error(tarjet)) {
        tarjet.log();
        fail();
    }

    expect(tarjet.amount).toBe(expected.amount);
    expect(tarjet.tip).toBe(expected.tip);

    const tarjet_shop = await pack_test(
        { entity: shop_earnings, date: target.date },
        test_name,
    )
        .bind(retrieve_earnings)
        .unpack();

    if (is_data_error(tarjet_shop)) {
        tarjet_shop.log();
        fail();
    }

    expect(tarjet_shop.amount).toBe(expected.amount);
    expect(tarjet_shop.tip).toBe(expected.tip);
});
