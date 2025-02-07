import { z } from "zod";

const Name = z.string();
const PhoneNumber = z.string();

export const CustomerId = z.object({
    customer_id: z.string(),
});
export type CustomerId = z.infer<typeof CustomerId>;

export const CustomerNameSearch = z.object({
    name_search: z.string(),
});
export type CustomerNameSearch = z.infer<typeof CustomerNameSearch>;

export const CustomerPhoneSearch = z.object({
    phone_search: z.string(),
});
export type CustomerPhoneSearch = z.infer<typeof CustomerPhoneSearch>;

export const CustomerCreationInfo = z.object({
    name: Name,
    phone_number: PhoneNumber,
});
export type CustomerCreationInfo = z.infer<typeof CustomerCreationInfo>;

export const Customer = z.object({
    id: z.string(),
    name: Name,
    phone_number: PhoneNumber,
    notes: z.string(),
});
export type Customer = z.infer<typeof Customer>;

export const CustomerUpdateData = z.object({
    name: Name,
    phone_number: PhoneNumber,
    notes: z.string(),
});
export type CustomerUpdateData = z.infer<typeof CustomerUpdateData>;

export const CustomerUpdateInfo = z.object({
    customer: Customer,
    update: CustomerUpdateData,
});
export type CustomerUpdateInfo = z.infer<typeof CustomerUpdateInfo>;
