import ClientSide from "./_components/ClientSide";
import { pack } from "~/server/queries/server_queries_monad";
import { get_all_technicians } from "~/server/queries/business/technician/technician_queries";
import { retrieve_roster } from "~/server/queries/crud/location/location_roster";
import { redirect } from "next/navigation";
import { get_bisquit } from "~/server/queries/crud/biscuits";
import { Bisquit } from "~/server/validation/bisquit";
import { is_data_error } from "~/server/data_error";

export default async function Ass() {
    const salon = get_bisquit(Bisquit.salon_selection);
    if (is_data_error(salon)) {
        redirect("/");
    }

    const technicians = await pack(undefined)
        .bind(get_all_technicians)
        .unpack();
    const roster = await pack({ location_id: salon })
        .bind(retrieve_roster)
        .unpack();

    if (is_data_error(technicians) || is_data_error(roster)) {
        redirect("/");
    }

    if (is_data_error(technicians.error)) {
        technicians.error.log();
        technicians.error.report();
    }

    return (
        <ClientSide
            technicians={technicians.data}
            roster={roster}
            salon={salon}
        />
    );
}
