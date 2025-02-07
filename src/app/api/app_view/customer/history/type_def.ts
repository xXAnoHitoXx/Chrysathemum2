import { z } from "zod";
import { Appointment } from "~/server/appointment/type_def";
import { Transaction } from "~/server/transaction/type_def";

export const CustomerHistoryData = z.object({
    appointments: z.array(Appointment),
    transactions: z.array(Transaction),
});
export type CustomerHistoryData = z.infer<typeof CustomerHistoryData>;
