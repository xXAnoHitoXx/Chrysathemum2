import 'server-only';
import { ref, remove } from "firebase/database";
import { f_db } from ".";
import { production_override } from './switch';

export function fb_root(redirect: string): string {
    if (redirect === production_override) {
        return process.env.PROJECT_NAME!.concat("/production/operarion/");
    }

    const env: string = (process.env.VERCEL_ENV === "production")? "production" : "development";
    const mode: string = (process.env.NODE_ENV === "test")? "test" : "operarion";
    return process.env.PROJECT_NAME!.concat("/", env , "/", mode, "/", redirect);
}

export async function clear_test_data(test_name: string) {
    const env: string = (process.env.VERCEL_ENV === "production")? "production" : "development";
    await remove(ref(f_db, process.env.PROJECT_NAME!.concat("/", env , "/test/", test_name)));
}

const customers_root="customers/";

export function fb_customer_entries(redirect:string): string { 
    return fb_root(redirect).concat(customers_root, "id/"); 
}
export function fb_customers_phone_index(redirect:string): string { 
    return fb_root(redirect).concat(customers_root, "phone_number/"); 
}
export function fb_customers_legacy_id_index(redirect:string): string { 
    return fb_root(redirect).concat(customers_root, "legacy_id/"); 
}

const technicians_root="technicians/";
export function fb_technician_entries(redirect: string): string { 
    return fb_root(redirect).concat(technicians_root, "id/");
}
export function fb_technicians_login(redirect: string): string { 
    return fb_root(redirect).concat(technicians_root, "login/");
}
export function fb_technicians_legacy_id_index(redirect: string): string { 
    return fb_root(redirect).concat(technicians_root, "legacy_id/");
};

const locations_root="locations/"
export function fb_location_entries(redirect: string) { 
    return fb_root(redirect).concat(locations_root, "id/");
};
export function fb_location_roster(redirect: string) { 
    return fb_root(redirect).concat(locations_root, "roster/");
};

/*
export type Transactions = { 
    id: string, 
    customer_id: string, 
    technician_id: string, 
    location_id: string,
    date: string, 
    time: bigint, 
    duration: bigint,
    amount: bigint,
    tip: bigint,
    description: string,
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
