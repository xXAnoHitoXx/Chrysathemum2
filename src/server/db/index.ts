import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from "@vercel/postgres";
import * as schema from "./schema";

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { env } from '~/env';

// Use this object to send drizzle queries to your DB
export const d_db = drizzle(sql, { schema });

const firebaseConfig = {
  apiKey: "AIzaSyDZq3TRh2t366xuuE4tMW9fIDIMTN0bQIs",
  authDomain: "chrysanthemumdb.firebaseapp.com",
  databaseURL: "https://chrysanthemumdb-default-rtdb.firebaseio.com",
  projectId: "chrysanthemumdb",
  storageBucket: "chrysanthemumdb.appspot.com",
  messagingSenderId: "151385711114",
  appId: "1:151385711114:web:49f82af428e10d62cef5f3",
  measurementId: "G-PLNR0K121Q"
};
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
const app = initializeApp(firebaseConfig);
export const f_db = getDatabase(app);
