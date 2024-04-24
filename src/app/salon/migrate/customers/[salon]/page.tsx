import { redirect } from "next/navigation";
import { migrate_customers } from "~/server/migration_querries";

export default async function Customers({ params } : { params: { salon: string } }) {
    await migrate_customers();
    redirect("/salon/nav/".concat(params.salon));
}
