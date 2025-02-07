import ClientSide from "./_components/ClientSide";
import { redirect } from "next/navigation";
import { Bisquit, get_bisquit } from "~/server/bisquit/bisquit";
import { is_data_error, report_partial_errors } from "~/server/data_error";
import { FireDB } from "~/server/fire_db";
import {
    retrieve_roster,
    RosterEntry,
} from "~/server/technician/components/roster_entry";
import { TechnicianQuery } from "~/server/technician/technician_queries";

export default async function Ass() {
    const salon = await get_bisquit(Bisquit.enum.salon_selection);
    if (is_data_error(salon)) {
        redirect("/");
    }

    const technicians = await TechnicianQuery.get_all_technician.call(
        undefined as void,
        FireDB.active(),
    );
    const roster = await retrieve_roster
        .chain<RosterEntry[]>(report_partial_errors)
        .call({ location_id: salon }, FireDB.active());

    if (is_data_error(technicians) || is_data_error(roster)) {
        redirect("/");
    }

    return <ClientSide technicians={technicians} roster={roster} />;
}
