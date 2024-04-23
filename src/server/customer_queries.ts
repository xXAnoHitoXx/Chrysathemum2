import { eq, ilike } from "drizzle-orm"
import { customers } from "./db/schema";
import { d_db } from "./db";

export type Customer = typeof customers.$inferSelect;

export async function create_customer(name: string, phone_number: string) : Promise<Customer[]> {
    return d_db.insert(customers).values({ name: name, phone_number: phone_number }).returning();
}

export async function find_customer_by_phone(phone_number: string) : Promise<Customer[]> {
    return d_db.select().from(customers).where(eq(customers.phone_number, phone_number));
}

export async function find_customer_by_name(name: string[]) : Promise<Customer[]> {
    let query = "";

    for (const word of name) {
        query = query.concat("%", word);
    }

    query = query.substring(1);

    return d_db.select().from(customers).where(ilike(customers.name, query));
}
