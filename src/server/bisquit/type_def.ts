import { z } from "zod";

export const Bisquit = z.enum(["salon_selection"]);
export type Bisquit = z.infer<typeof Bisquit>;

export const BisquitStore = z.object({
    name: Bisquit,
    value: z.string(),
});
export type BisquitStore = z.infer<typeof BisquitStore>;

