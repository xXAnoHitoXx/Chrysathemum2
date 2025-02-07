import { report_partial_errors } from "../data_error";
import { array_query, ServerQuery } from "../server_query";
import {
    create_roster_entry,
    delete_roster_entry,
    retrieve_roster,
    RosterEntry,
} from "./components/roster_entry";
import {
    create_technician_entry,
    retrieve_all_technician_entries,
    retrieve_technician_entry,
    update_technician_entry,
} from "./components/technician_entry";
import {
    LocationId,
    Technician,
    TechnicianCreationInfo,
    TechnicianId,
} from "./type_def";

export class TechnicianQuery {
    static create_new_technician: ServerQuery<
        TechnicianCreationInfo,
        Technician
    > = ServerQuery.from_builder((info: TechnicianCreationInfo) =>
        create_technician_entry.chain(
            ServerQuery.from_builder((technician: Technician) =>
                ServerQuery.create_query((technician: Technician) => {
                    return {
                        location_id: info.active_salon,
                        technician_id: technician.id,
                    };
                })
                    .chain(create_roster_entry)
                    .chain<Technician>(() => technician),
            ),
        ),
    );

    static mark_active: ServerQuery<Technician, void> =
        ServerQuery.create_query<Technician, Technician>((tech) => {
            tech.active = true;
            return tech;
        }).chain(update_technician_entry);

    static mark_inactive: ServerQuery<Technician, void> =
        ServerQuery.create_query<Technician, Technician>((tech) => {
            tech.active = false;
            return tech;
        }).chain(update_technician_entry);

    static assign_tech_to_location: ServerQuery<RosterEntry, void> =
        ServerQuery.from_builder((entry) =>
            create_roster_entry
                .chain<TechnicianId>(() => {
                    return { tech_id: entry.technician_id };
                })
                .chain(retrieve_technician_entry)
                .chain(TechnicianQuery.mark_active),
        );

    static unassign_tech_from_location: ServerQuery<RosterEntry, void> =
        delete_roster_entry;

    static get_tech_at_location: ServerQuery<LocationId, Technician[]> =
        retrieve_roster
            .chain<RosterEntry[]>(report_partial_errors)
            .chain<TechnicianId[]>((arr: RosterEntry[]) =>
                arr.map((entry) => {
                    return { tech_id: entry.technician_id };
                }),
            )
            .chain<Technician[]>(array_query(retrieve_technician_entry));

    static get_all_technician: ServerQuery<void, Technician[]> =
        retrieve_all_technician_entries.chain<Technician[]>(
            report_partial_errors,
        );
}
