import { z } from "zod";

export const TransactionEntry = z.object({
    id: z.string(),
    customer_id: z.string(),
    technician_id: z.string(),
    salon: z.string(),
    date: z.string(),
    time: z.number(),
    details: z.string(),
    amount: z.number(),
    tip: z.number(),
    cash: z.number(),
    gift: z.number(),
    discount: z.number(),
});
export type TransactionEntry = z.infer<typeof TransactionEntry>;

export const TransactionRecordID = z.object({
    date: z.string(),
    salon: z.string(),
});
export type TransactionRecordID = z.infer<typeof TransactionRecordID>;

export const TransactionID = z.object({
    date: z.string(),
    salon: z.string(),
    entry_id: z.string(),
});
export type TransactionID = z.infer<typeof TransactionID>;

export const CustomerHistoryIndex = z.object({
    customer_id: z.string(),
    date: z.string(),
    salon: z.string(),
    transaction_id: z.string(),
});
export type CustomerHistoryIndex = z.infer<typeof CustomerHistoryIndex>;
