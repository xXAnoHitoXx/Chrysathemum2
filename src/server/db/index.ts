import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from "@vercel/postgres";
import * as schema from "./schema";

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { env } from '~/env';

// Use this object to send drizzle queries to your DB
export const d_db = drizzle(sql, { schema });

const fisebase_config = {
    apiKey: env.API_KEY,
    authDomain: env.AUTH_DOMAIN,
    databaseURL: env.FIREBASE_URL,
    projectId: env.PROJECT_ID,
    storageBucket: env.STORAGE_BUCKET,
    messagingSenderId: env.MESSAGING_SENDER_ID,
    appId: env.APP_ID,
    measurementId: env.MEASURMENT_ID,
}
const app = initializeApp(fisebase_config);
export const f_db = getDatabase(app);
