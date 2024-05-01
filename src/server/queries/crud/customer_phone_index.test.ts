import type { Customer } from "~/server/db_schema/fb_schema";
import { create_phone_index, delete_phone_index, retrieve_phone_index } from "./customer_phone_index";

test("test customer_phone_index CRUDs querries", async () => {
    const test_name = "test_customer_phone_index_cruds";

    const customer_1: Customer = {
        id: "Banana",
        name: "Pizza",
        phone_number: "Your Mother",
    }

    const customer_2: Customer = {
        id: "Anana",
        name: "Pineapple",
        phone_number: "Your Mother",
    }

    let index = await retrieve_phone_index(customer_1.phone_number, test_name);
    expect(index).toHaveLength(0);

    await create_phone_index(customer_1, test_name);
    await create_phone_index(customer_2, test_name);

    index = await retrieve_phone_index(customer_1.phone_number, test_name);
    expect(index).toHaveLength(2);
    expect(index).toContain(customer_1.id);
    expect(index).toContain(customer_2.id);

    await delete_phone_index(customer_1, test_name);
    index = await retrieve_phone_index(customer_1.phone_number, test_name);
    expect(index).toHaveLength(1);
    expect(index).not.toContain(customer_1.id);
    expect(index).toContain(customer_2.id);
})
