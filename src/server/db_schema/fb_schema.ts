import "server-only";
import { DatabaseReference, ref, remove } from "firebase/database";
import { f_db } from ".";
import { ano_iter } from "~/util/anoiter/anoiter";
import { data_error, DataError } from "../data_error";
import { db_query } from "../queries/server_queries_monad";

export const PATH_ENTRIES = "id/";

export const PATH_DATES = "dates/";

export const PATH_APPOINTMENTS = "appointments/";
export const PATH_TRANSACTIONS = "transactions/";
export const PATH_UPDATE_COUNT = "update_count";

const prod = "production";
const dev = "development";
const test = "test";
const operarion = "operarion";

const customers_root = "customers/";
const technicians_root = "technicians/";
const locations_root = "locations/";
const accounting_root = "accounting/";

export async function clear_test_data(
    test_name: string,
): Promise<DataError | void> {
    const context = "cleanup after test suit { ".concat(test_name, " }");
    const fire_db: FireDB = new FireDB(test_name);

    if (!fire_db.is_in_test_mode()) {
        return data_error(context, "Node ENV is not in test mode");
    }

    await db_query(context, remove(fire_db.root()));
}

export class FireDB {
    private root_path: string;

    constructor(redirect = "") {
        const env: string = process.env.VERCEL_ENV === prod ? prod : dev;
        const mode: string = this.is_in_test_mode() ? test : operarion;
        this.root_path = process.env.PROJECT_NAME!.concat(
            "/",
            env,
            "/",
            mode,
            "/",
            redirect,
        );
    }

    prod(): FireDB {
        const prod_db = new FireDB();
        const mode: string = this.is_in_test_mode() ? test : operarion;
        prod_db.root_path = process.env.PROJECT_NAME!.concat(
            "/",
            prod,
            "/",
            mode,
            "/",
        );
        return prod_db;
    }

    is_in_test_mode(): boolean {
        return process.env.NODE_ENV === test;
    }

    root(): DatabaseReference {
        return ref(f_db, this.root_path);
    }

    customer_entries(sub_path: string[]): DatabaseReference {
        return this.ref(customers_root, "id/", sub_path);
    }

    customers_phone_index(sub_path: string[]): DatabaseReference {
        return this.ref(customers_root, "phone_number/", sub_path);
    }

    customers_transaction_history(sub_path: string[]): DatabaseReference {
        return this.ref(customers_root, "history/", sub_path);
    }

    customers_appointment_list(sub_path: string[]): DatabaseReference {
        return this.ref(customers_root, "appointments/", sub_path);
    }

    customers_legacy_id_index(sub_path: string[]): DatabaseReference {
        return this.ref(customers_root, "legacy_id/", sub_path);
    }

    technician_entries(sub_path: string[]): DatabaseReference {
        return this.ref(technicians_root, "id/", sub_path);
    }

    technician_login(sub_path: string[]): DatabaseReference {
        return this.ref(technicians_root, "login/", sub_path);
    }

    technician_legacy_index(sub_path: string[]): DatabaseReference {
        return this.ref(technicians_root, "legacy_id/", sub_path);
    }

    location_entries(sub_path: string[]): DatabaseReference {
        return this.ref(locations_root, "id/", sub_path);
    }

    location_roster(sub_path: string[]): DatabaseReference {
        return this.ref(locations_root, "roster/", sub_path);
    }

    location_schedule(sub_path: string[]): DatabaseReference {
        return this.ref(locations_root, "schedule/", sub_path);
    }

    accounting_date_entries(
        date: string,
        sub_path: string[],
    ): DatabaseReference {
        return this.ref(date, accounting_root, sub_path);
    }

    old_db(sub_path: string[]): DatabaseReference {
        let path = "/";
        sub_path.forEach((branch) => {
            path = path.concat(branch, "/");
        });
        return ref(f_db, path);
    }

    access(sub_path: string[]): DatabaseReference {
        let path = "/";
        sub_path.forEach((branch) => {
            path = path + branch + "/";
        });
        return ref(f_db, this.root_path + path);
    }

    private ref(root: string, branch: string, sub_path: string[]) {
        let path = ano_iter(sub_path).reduce(
            (u: string, t: string) => u.concat(t, "/"),
            branch,
        );
        return ref(f_db, this.root_path.concat(root, path));
    }
}

/*
export type Transactions = {
    id:string,
    customer_id:string,
    technician_id:string,
    location_id:string,
    date:string,
    time: bigint,
    duration: bigint,
    amount: bigint,
    tip: bigint,
    description:string,
};
const transactions_root="transactions/";
export const fb_transaction_entries = () => { return root.concat(transactions_root, "id/"); };
export const fb_transactions_date_index = () => { return root.concat(transactions_root, "date/"); };
export const fb_transactions_customer_index = () => { return root.concat(transactions_root, "customers/"); };

export type Acounting = {
    amount: bigint,
    tip: bigint,
};

export type Closing = {
    cash: bigint,
    machine: bigint,
    gift: bigint,
    discount: bigint,
};
*/
