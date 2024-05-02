import 'server-only';

import { type DataSnapshot, ref, set, get, remove } from "firebase/database";
import { f_db } from "~/server/db_schema";
import { fb_customers_legacy_id_index } from "~/server/db_schema/fb_schema";

export async function create_customer_migration_index({customer_id, legacy_id}: {customer_id: string, legacy_id: string}, redirect: string) {
    await set(ref(f_db, fb_customers_legacy_id_index(redirect).concat(legacy_id)), customer_id);
}

export async function retrieve_customer_id_from_legacy_id(legacy_id: string, redirect: string): Promise<string | null> {
    const data: DataSnapshot = await get(ref(f_db, fb_customers_legacy_id_index(redirect).concat(legacy_id)));

    if(!data.exists()) {
        return null;
    }
    
    return data.val() as string;
}

export async function delete_customer_migration_index(legacy_id: string, redirect: string) {
    await remove(ref(f_db, fb_customers_legacy_id_index(redirect).concat(legacy_id)));
}
