import { z } from "zod";

export const OldTransactionEntryData = z.object({
    amount: z.string(),
    appointmentTime: z.string(),
    customerID: z.number(),
    date: z.string(),
    duration: z.string(),
    services: z.string(),
    technicianID: z.number(),
    tip: z.string(),
});
export type OldTransactionEntryData = z.infer<typeof OldTransactionEntryData>;

export const OldTransactionEntry = z.object({
    id: z.string(),
    amount: z.string(),
    appointmentTime: z.string(),
    customerID: z.number(),
    date: z.string(),
    duration: z.string(),
    services: z.string(),
    technicianID: z.number(),
    tip: z.string(),
});
export type OldTransactionEntry = z.infer<typeof OldTransactionEntry>;
