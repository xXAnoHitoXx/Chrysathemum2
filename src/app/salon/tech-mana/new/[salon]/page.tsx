import type { Technician } from "~/server/db_schema/type_def";
import { get_active_technicians } from "~/server/queries/business/technician_queries";
import { NewTechForm } from "./_components/NewTechForm";

export default async function Page({ params }: {params : { tag: string, salon: string }}) {
    const technicians: Technician[] = await get_active_technicians();
    return <NewTechForm starting_active_technicians={technicians} salon={params.salon}/>;
}
