import { z } from "zod";

export const OldCustomerEntry = z.object({
    id: z.number(),
    name: z.string(),
    phoneNumber: z.number(),
});
export type OldCustomerEntry = z.infer<typeof OldCustomerEntry>;
