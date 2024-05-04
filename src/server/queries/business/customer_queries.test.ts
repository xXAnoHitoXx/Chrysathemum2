import { clear_test_data, type Customer } from "~/server/db_schema/fb_schema";
import { create_new_customer } from "./customer_queries";
import { retrieve_customer_entry } from "../crud/customer/customer_entry";
import { retrieve_customer_phone_index } from "../crud/customer/customer_phone_index";

const test_suit = "customer_business_logic";

afterAll(async () => {
    await clear_test_data(test_suit);
})

test("customer creation", async () => {
    const test_name = test_suit.concat("/customer_creation/");

    const customer_info = {
        name: "Justin",
        phone_number: "Thyme"
    };

    const customer: Customer = await create_new_customer(customer_info, test_name);
    expect(customer.name).toBe(customer_info.name);
    expect(customer.phone_number).toBe(customer_info.phone_number);

    const entry: Customer | null = await retrieve_customer_entry(customer.id, test_name);
    expect(entry).not.toBeNull();
    if(entry != null){
        expect(entry.id).toBe(customer.id);
        expect(entry.name).toBe(customer.name);
        expect(entry.phone_number).toBe(customer.phone_number);
    }

    const phone_index: string[] = await retrieve_customer_phone_index(customer.phone_number, test_name);
    expect(phone_index).toContain(customer.id);
})
