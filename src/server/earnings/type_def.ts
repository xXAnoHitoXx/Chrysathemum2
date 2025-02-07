import { z } from "zod";
import { Account, Closing } from "../transaction/type_def";
import { Technician } from "../technician/type_def";

export const TechnicianEarnings = z.object({
    date: z.string(),
    tech: Technician,
    account: Account,
    closing: Closing,
})
export type TechnicianEarnings = z.infer<typeof TechnicianEarnings>;

export const EarningRecordID = z.object({
    salon: z.string(),
    date: z.string().date(),
});
export type EarningRecordID = z.infer<typeof EarningRecordID>;

export const EarningEntryID = z.object({
    salon: z.string(),
    date: z.string().date(),
    id: z.string(),
})
export type EarningEntryID = z.infer<typeof EarningEntryID>;

export const EarningEntry = z.object({
    id: z.string(),
    account: Account,
    closing: Closing,
});
export type EarningEntry = z.infer<typeof EarningEntry>;

export const EarningRecord = z.object({
    salon: z.string(),
    date: z.string().date(),
    earnings: z.array(EarningEntry),
});
export type EarningRecord = z.infer<typeof EarningEntry>;

export const EarningEntryCreationInfo = z.object({
    salon: z.string(),
    date: z.string().date(),
    entries: z.array(EarningEntry),
});
export type EarningEntryCreationInfo = z.infer<typeof EarningEntryCreationInfo>;
