const root="c2/";

export type Customer = { 
    id: string, 
    name: string, 
    phone_number: string 
};
const customers_root="customers/";
export const fb_customers=root.concat(customers_root, "id/");
export const fb_customers_phone_index=root.concat(customers_root, "phone_number/");
export const fb_customers_legacy_id_index=root.concat(customers_root, "legacy_id/");

export type Technician = { 
    id: string, 
    name: string, 
    color: string 
};
const technicians_root="technicians/";
export const fb_technicians=root.concat(technicians_root, "id/");
export const fb_technicians_activity=root.concat(technicians_root, "activity/");
export const fb_technicians_login=root.concat(technicians_root, "login/")
export const fb_technicians_legacy_id_index=root.concat(technicians_root, "legacy_id");

export type Location = { 
    id: string, 
    address: string 
};
const locations_root="locations/"
export const fb_locations=root.concat(locations_root, "id/");

export type Transactions = { 
    id: string, 
    customer_id: string, 
    technician_id: string, 
    location_id: string,
    date: string, 
    time: number, 
    duration: number,
    amount: number,
    tip: number,
    description: string,
};
const transactions_root="transactions/";
export const fb_transactions=root.concat(transactions_root, "id/");
export const fb_transactions_date_index=root.concat(transactions_root, "date/");
export const fb_transactions_customer_index=root.concat(transactions_root, "customers/");

export type Acounting = {
    amount: number,
    tip: number,
};

export type Closing = {
    cash: number,
    machine: number,
    gift: number,
    discount: number,
};
