import { Bisquit, get_bisquit } from "~/server/bisquit/bisquit";
import { NewTechForm } from "./_components/NewTechForm";
import { redirect } from "next/navigation";
import { is_data_error } from "~/server/data_error";
import { FireDB } from "~/server/fire_db";
import { TechnicianQuery } from "~/server/technician/technician_queries";
import { Technician } from "~/server/technician/type_def";

export default async function Page() {
    const technicians = await TechnicianQuery.get_all_technician
        .chain<Technician[]>((technicans) => technicans.filter(
            (technician) => technician.active
        )).call(undefined as void, FireDB.active());

    if (is_data_error(technicians)) {
        redirect("/");
    }

    const salon = await get_bisquit(Bisquit.enum.salon_selection);

    if (is_data_error(salon)) {
        redirect("/");
    }

    return (
        <NewTechForm starting_active_technicians={technicians} salon={salon} />
    );
}
