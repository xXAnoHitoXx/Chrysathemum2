let root: Mode = "c2/";

export const fb_root = () => { return root };

type Mode = "c2/" | "test/";

export function enableTestMode() {
    root = "test/";
}

export function desableTestMode() {
    root = "c2/";
}

export type Customer = { 
    id: string, 
    name: string, 
    phone_number: string 
};
const customers_root="customers/";
export const fb_customers = () => { return root.concat(customers_root, "id/"); };
export const fb_customers_phone_index = () => { return root.concat(customers_root, "phone_number/"); };
export const fb_customers_legacy_id_index = () => { return root.concat(customers_root, "legacy_id/"); };

export type Technician = { 
    id: string, 
    name: string, 
    color: string 
};
const technicians_root="technicians/";
export const fb_technicians = () => { return root.concat(technicians_root, "id/"); };
export const fb_technicians_activity = () => { return root.concat(technicians_root, "activity/"); };
export const fb_technicians_login = () => { return root.concat(technicians_root, "login/") };
export const fb_technicians_legacy_id_index = () => { return root.concat(technicians_root, "legacy_id"); };

export type Location = { 
    id: string, 
    address: string 
};
const locations_root="locations/"
export const fb_locations = () => { return root.concat(locations_root, "id/"); };

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
export const fb_transactions = () => { return root.concat(transactions_root, "id/"); };
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
