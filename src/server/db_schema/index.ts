import "server-only";

//import { drizzle } from 'drizzle-orm/vercel-postgres';
//import { sql } from "@vercel/postgres";
//import * as schema from "./driz_schema";

// Use this object to send drizzle queries to your DB
//export const d_db = drizzle(sql, { schema });

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebase_config = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_URL,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASURMENT_ID,
};
const app = initializeApp(firebase_config);
export const f_db = getDatabase(app);
