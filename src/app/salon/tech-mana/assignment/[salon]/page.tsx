import ClientSide from "./_component/ClientSide";
import { pack } from "~/server/queries/server_queries_monad";
import { get_all_technicians } from "~/server/queries/business/technician/technician_queries";
import { retrieve_roster } from "~/server/queries/crud/location/location_roster";
import { is_server_error } from "~/server/server_error";
import { redirect } from "next/navigation";

export default async function Ass({ params }: { params: { salon: string } }) {
    const technicians = await pack(undefined).bind(get_all_technicians).unpack();
    const roster = await pack({ location_id: params.salon }).bind(retrieve_roster).unpack();

    if(is_server_error(technicians) || is_server_error(roster)) {
        redirect("/");
    }

    return <ClientSide technicians={technicians} roster={roster} salon={params.salon} />
}
