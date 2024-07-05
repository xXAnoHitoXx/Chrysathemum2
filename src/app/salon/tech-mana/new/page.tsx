import { NewTechForm } from "./_components/NewTechForm";
import { pack } from "~/server/queries/server_queries_monad";
import { get_active_technicians } from "~/server/queries/business/technician/technician_queries";
import { is_server_error } from "~/server/server_error";
import { redirect } from "next/navigation";
import { get_bisquit } from "~/server/queries/crud/biscuits";
import { Bisquit } from "~/server/validation/bisquit";

export default async function Page() {
    const technicians = await pack(undefined).bind(get_active_technicians).unpack();
    if (is_server_error(technicians)) { redirect("/") }

    const salon = get_bisquit(Bisquit.salon_selection);

    if(salon == undefined) {
        redirect("/");
    }

    return <NewTechForm starting_active_technicians={technicians} salon={salon}/>;
}
