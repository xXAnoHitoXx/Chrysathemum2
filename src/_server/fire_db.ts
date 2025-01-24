import "server-only";
import { DatabaseReference, ref } from "firebase/database";
import { f_db } from "~/server/db_schema";

export const PATH_ENTRIES = "id/";
export const MIGRATION_INDEX = "legacy_id/";
export const LOGIN =  "login/";

export const CUSTOMER_ROOT = "customers/";
export const PHONE_INDEX = "phone_number/";

export const TECHNICIAN_ROOT = "technicians/";

export const LOCATION_ROOT = "locations/";
export const ROSTER =  "roster/";

export const DATES = "dates/";

export const APPOINTMENTS_ROOT = "appointments/";

// --------------------------------------------------------------------------------------
const prod = "production";
const dev = "development";
const test = "_t_e_s_t_";
const operarion = "operarion";

export class FireDB {
    private root_path: string;

    private constructor(path: string) {
        this.root_path = process.env.PROJECT_NAME! + "/" + path;
    }

    static active(): FireDB {
        const env: string = process.env.VERCEL_ENV === prod ? prod : dev;
        return new FireDB(env + "/" + operarion + "/");
    }

    static test(test_name: string): FireDB {
        const env: string = process.env.VERCEL_ENV === prod ? prod : dev;
        return new FireDB(env + "/" + test + "/" + test_name);
    }

    static prod(): FireDB {
        return new FireDB(prod + "/" + operarion + "/");
    }

    in_test_mode(): boolean {
        return this.root_path.includes("/" + test + "/");
    }

    old_db(sub_path: string[]): DatabaseReference {
        let path = "/";
        for (const sub of sub_path) {
            path += sub + "/";
        }
        return ref(f_db, path);
    }

    access(sub_path: string[]): DatabaseReference {
        let path = "/";
        for (const sub of sub_path) {
            path += sub + "/";
        }
        return ref(f_db, this.root_path + path);
    }
}
