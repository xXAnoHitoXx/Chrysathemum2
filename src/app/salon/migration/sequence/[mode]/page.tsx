import { ref, remove } from "firebase/database";
import { redirect } from "next/navigation";
import { f_db } from "~/server/db_schema";
import { production_override } from "~/server/db_schema/switch";
import { import_customer_from_old_db } from "~/server/queries/migration/customer";

export default async function MigrationSequence({ params }: { params: { mode: string } }) {
    await remove(ref(f_db, process.env.PROJECT_NAME!.concat("/production/operation/")));

    const key = (params.mode === "production")? production_override : "";
    await import_customer_from_old_db(key);
    redirect("/salon/nav/5CBL")
}
