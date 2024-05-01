import type { Customer } from "../db/fb_schema"
import { create_customer, read_customer } from "./customers"

test("test customers CRUDs querries", async () => {
    const test_customer: Customer = await create_customer("Tinn", "your mother is a murloc");

    const created_customer: Customer | null = await read_customer(test_customer.id);
    
    expect(create_customer).not.toBeNull();
    if (created_customer != null) {
        expect(created_customer.id).toBe(test_customer.id);
        expect(created_customer.name).toBe(test_customer.name);
        expect(created_customer.phone_number).toBe(test_customer.phone_number);
    }
})
