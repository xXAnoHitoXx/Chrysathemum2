import { redirect } from "next/navigation";
import { import_customer_from_old_db } from "~/server/queries/migration/customer";

export default async function MigrationSequence() {
    await import_customer_from_old_db();
    redirect("/salon/nav/5CBL")
}
