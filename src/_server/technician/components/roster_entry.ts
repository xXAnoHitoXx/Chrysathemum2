import { get, remove, set } from "firebase/database";
import { z } from "zod";
import { DataError } from "~/_server/data_error";
import { LOCATION_ROOT, ROSTER } from "~/_server/fire_db";
import { ServerQuery } from "~/_server/server_query";
import { LocationId } from "../type_def";

export const RosterEntry = z.object({
    location_id: z.string(),
    technician_id: z.string(),
});
export type RosterEntry = z.infer<typeof RosterEntry>;

function roster_entries(
    location_id: string,
    technician_id: string | null = null,
): string[] {
    return technician_id === null
        ? [LOCATION_ROOT, ROSTER, location_id]
        : [LOCATION_ROOT, ROSTER, location_id, technician_id];
}

export const create_roster_entry: ServerQuery<RosterEntry, void> =
    ServerQuery.create_query(async (entry, f_db) => {
        try {
            await set(
                f_db.access(
                    roster_entries(entry.location_id, entry.technician_id),
                ),
                entry,
            );
        } catch {
            return new DataError("creating roster entry - db connection error");
        }
    });

export const retrieve_roster: ServerQuery<
    LocationId,
    (RosterEntry | DataError)[]
> = ServerQuery.create_query(async ({ location_id }, f_db) => {
    const context = `Retrieving Roster ${location_id}`;

    let data;
    try {
        data = await get(f_db.access(roster_entries(location_id)));
    } catch {
        return new DataError(context + " - db connection error");
    }

    const roster: (RosterEntry | DataError)[] = [];

    if (data.exists()) {
        data.forEach((child) => {
            const entry = RosterEntry.safeParse(child.val());
            if (entry.success) {
                roster.push(entry.data);
            } else {
                roster.push(new DataError(context + " - corrupted entry"));
            }
        });
    }

    return roster;
});

export const delete_roster_entry: ServerQuery<RosterEntry, void> =
    ServerQuery.create_query(async ({ location_id, technician_id }, f_db) => {
        try {
            await remove(
                f_db.access(roster_entries(location_id, technician_id)),
            );
        } catch {
            return new DataError(
                `Removing technician ${technician_id} from ${location_id}`,
            );
        }
    });
