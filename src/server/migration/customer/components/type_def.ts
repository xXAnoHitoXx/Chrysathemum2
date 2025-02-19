import { z } from "zod";

export const OldCustomerEntry = z.object({
    id: z.number(),
    name: z.string(),
    phoneNumber: z.number(),
});
export type OldCustomerEntry = z.infer<typeof OldCustomerEntry>;

export const LegacyCustomerIndex = z.object({
    legacy_id: z.string(),
    customer_id: z.string(),
}) 
export type LegacyCustomerIndex = z.infer<typeof LegacyCustomerIndex>;
