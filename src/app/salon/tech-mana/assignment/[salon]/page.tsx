import { type Technician } from "~/server/db_schema/type_def";
import ClientSide from "./_component/ClientSide";
import { get_all_technicians } from "~/server/queries/business/technician_queries";
import { retrieve_roster_ids } from "~/server/queries/crud/location/location_roster";

export default async function Ass({ params }: { params: { salon: string } }) {
    const technicians: Technician[] = await get_all_technicians();
    const roster: string[] = await retrieve_roster_ids(params.salon);

    return <ClientSide technicians={technicians} roster={roster} salon={params.salon} />
}

