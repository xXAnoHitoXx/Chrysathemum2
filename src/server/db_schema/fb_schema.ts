import 'server-only';
import { DatabaseReference, ref, remove } from "firebase/database";
import { f_db } from ".";
import { QueryError } from '../queries/queries_monad';
import { ano_iter } from '~/util/anoiter/anoiter';
import { server_error } from '../server_error';

const prod="production";
const dev="development";
const test="test";
const operarion="operarion";

const customers_root="customers/";
const technicians_root="technicians/";

export async function clear_test_data(test_name: string): Promise<QueryError | null> {
    const fire_db: FireDB = new FireDB(test_name);

    if (!fire_db.is_in_test_mode()) {
        const message = "Node ENV is not in test mode";
        console.log(message);
        return server_error(message);
    }

    await remove(fire_db.root());
    return null;
}

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

    customer_entries(sub_path: string[] = []): DatabaseReference {
        return this.ref(customers_root, "id/", sub_path);
    }

    customers_phone_index(sub_path : string[] = []): DatabaseReference {
        return this.ref(customers_root, "phone_number/", sub_path);
    }

    customers_legacy_id_index(sub_path : string[] = []): DatabaseReference {
        return this.ref(customers_root, "legacy_id/", sub_path);
    }
    
    technician_entries(sub_path : string[] = []): DatabaseReference {
        return this.ref(technicians_root, "id/", sub_path);
    }

    technician_login(sub_path: string[] = []): DatabaseReference {
        return this.ref(technicians_root, "login/", sub_path);
    }

    technician_legacy_index(sub_path: string[] = []): DatabaseReference {
        return this.ref(technicians_root, "legacy_id/", sub_path);
    }

    private ref(root: string, branch: string, sub_path: string[]){
        let path = ano_iter(sub_path).reduce(
            (u: string, t: string) => (u.concat(t, "/")), 
            branch
        );
        return ref(f_db, this.root_path.concat(root, path))
    }
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
