import ClientSide from "./_components/ClientSide";
import { pack } from "~/server/queries/server_queries_monad";
import { get_all_technicians } from "~/server/queries/business/technician/technician_queries";
import { retrieve_roster } from "~/server/queries/crud/location/location_roster";
import { is_server_error } from "~/server/server_error";
import { redirect } from "next/navigation";
import { get_bisquit } from "~/server/queries/crud/biscuits";
import { Bisquit } from "~/server/validation/bisquit";

export default async function Ass() {

    const salon = get_bisquit(Bisquit.salon_selection);
    if(salon == undefined) {
        redirect("/")
    }

    const technicians = await pack(undefined).bind(get_all_technicians).unpack();
    const roster = await pack({ location_id: salon }).bind(retrieve_roster).unpack();

    if(is_server_error(technicians) || is_server_error(roster)) {
        redirect("/");
    }

    return <ClientSide technicians={technicians} roster={roster} salon={salon} />
}
