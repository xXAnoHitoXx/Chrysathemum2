import { clear_test_data } from "~/server/db_schema/fb_schema";

const test_suit = "transaction_cruds";

afterAll(async () => {
    await clear_test_data(test_suit);
})

test("test transaction_entries CRUDs querries", async () => {

});
