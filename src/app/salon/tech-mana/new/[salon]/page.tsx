import { NewTechForm } from "./_components/NewTechForm";
import { pack } from "~/server/queries/server_queries_monad";
import { get_active_technicians } from "~/server/queries/business/technician/technician_queries";
import { is_server_error } from "~/server/server_error";
import { redirect } from "next/navigation";

export default async function Page({ params }: {params : { tag: string, salon: string }}) {
    const technicians = await pack(undefined).bind(get_active_technicians).unpack();
    if (is_server_error(technicians)) { redirect("/") }
    return <NewTechForm starting_active_technicians={technicians} salon={params.salon}/>;
}
