import { z } from "zod";

import {
    BOARD_ENDING_HOUR,
    BOARD_STARTING_HOUR,
} from "~/util/appointment_time";

export const Hour = z.object({
    open: z.number().gte(BOARD_STARTING_HOUR),
    close: z.number().lt(BOARD_ENDING_HOUR),
});
export type Hour = z.infer<typeof Hour>;

