import 'server-only';
import { DatabaseReference, ref } from "firebase/database";
import { f_db } from ".";

const prod="production";
const dev="development";
const test="test";
const operarion="operarion";

const customers_root="customers/";

export class FireDB {
    private root_path: string;

    constructor(redirect = "") {
        const env: string = (process.env.VERCEL_ENV === prod)? prod : dev;
        const mode: string = this.is_in_test_mode()? test : operarion;
        this.root_path = process.env.PROJECT_NAME!.concat("/", env , "/", mode, "/", redirect);
    }

    is_in_test_mode(): boolean {
        return process.env.NODE_ENV === test;
    }

    root(): DatabaseReference {
        return ref(f_db, this.root_path);
    }

    customer_entries(): DatabaseReference {
        return ref(f_db, this.root_path.concat(customers_root, "id/"));
    }
    customers_phone_index(): DatabaseReference {
        return ref(f_db, this.root_path.concat(customers_root, "phone_number/"));
    }
    customers_legacy_id_index(): DatabaseReference {
        return ref(f_db, this.root_path.concat(customers_root, "legacy_id/"));
    }
}

const technicians_root="technicians/";
export function fb_technician_entries(fb_root: string):string { 
    return fb_root.concat(technicians_root, "id/");
}
export function fb_technicians_login(fb_root: string):string { 
    return fb_root.concat(technicians_root, "login/");
}
export function fb_technicians_legacy_id_index(fb_root: string):string { 
    return fb_root.concat(technicians_root, "legacy_id/");
}

const locations_root="locations/";
export function fb_location_entries(fb_root: string) { 
    return fb_root.concat(locations_root, "id/");
}
export function fb_location_roster(fb_root: string) { 
    return fb_root.concat(locations_root, "roster/");
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
