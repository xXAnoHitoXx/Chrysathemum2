//import { remove } from "firebase/database";
import { redirect } from "next/navigation";
//import { FireDB } from "~/server/db_schema/fb_schema";

export default async function Page() {
    //const fdb = new FireDB();
    //await remove(fdb.customer_entries([]));
    //await remove(fdb.customers_legacy_id_index([]));
    //await remove(fdb.customers_phone_index([]));
    redirect("/");
}
