import { type Config } from "drizzle-kit";

import { env } from "~/env";

export default {
    schema: "./src/server/db/schema.ts",
    driver: "pg",
    dbCredentials: {
        connectionString: env.POSTGRES_URL,
    },
    tablesFilter: ["chrysanthemum-2_*"],
} satisfies Config;
