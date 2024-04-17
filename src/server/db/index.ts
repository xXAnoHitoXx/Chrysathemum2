import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from "@vercel/postgres";
import * as schema from "./schema";

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { env } from '~/env';

// Use this object to send drizzle queries to your DB
export const d_db = drizzle(sql, { schema });

const fisebase_config = {
    databaseURL: env.FIREBASE_URL,
}
const app = initializeApp(fisebase_config);
export const f_db = getDatabase(app);
