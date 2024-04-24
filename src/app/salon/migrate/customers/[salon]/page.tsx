import { redirect } from "next/navigation";
import { migrate_customers } from "~/server/migration/customers_migration";

export default async function Customers({ params } : { params: { salon: string } }) {
    await migrate_customers();
    redirect("/salon/nav/".concat(params.salon));
}
