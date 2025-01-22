import { ServerQuery } from "~/_server/server_query";
import { Technician, TechnicianCreationInfo, TechnicianId } from "../type_def";
import { PATH_ENTRIES, TECHNICIAN_ROOT } from "~/_server/fire_db";
import { DataError, is_data_error } from "~/_server/data_error";
import { get, push, remove, set, update } from "firebase/database";

function tech_entries(id: string | null = null): string[] {
    return id === null
        ? [TECHNICIAN_ROOT, PATH_ENTRIES]
        : [TECHNICIAN_ROOT, PATH_ENTRIES, id];
}

export const create_technician_entry: ServerQuery<
    TechnicianCreationInfo,
    Technician
> = ServerQuery.create_query(async (params, f_db) => {
    const context = "Creating Technician entry { ".concat(params.name, " }");
    let id_ref;

    try {
        id_ref = push(f_db.access(tech_entries()));
    } catch {
        return new DataError(context + " - db connection error generating id");
    }

    if (id_ref.key == null) {
        return new DataError(
            context + " - failed to create technician_entry null id",
        );
    }

    const technician_entry = {
        id: id_ref.key,
        name: params.name,
        color: params.color,
        active: true,
    };

    try {
        await set(id_ref, technician_entry);
    } catch {
        return new DataError(context + " - db connnection error upload entry");
    }

    const tech: Technician = {
        login_claimed: undefined,
        ...technician_entry,
    };

    return tech;
});

export const retrieve_technician_entry: ServerQuery<TechnicianId, Technician> =
    ServerQuery.create_query(async ({ tech_id }, f_db) => {
        const context = "Retrieve Technician entry { ".concat(tech_id, " }");

        let data;
        try {
            data = await get(f_db.access(tech_entries(tech_id)));
        } catch {
            return new DataError(context + " - db connection error");
        }

        if (is_data_error(data)) return data;

        if (!data.exists()) {
            return new DataError(context + " - entry doesn't exist");
        }

        const e = Technician.safeParse(data.val());
        if (e.success) {
            return e.data;
        } else {
            return new DataError(
                context + " - corrupted entry\n" + e.error.toString(),
            );
        }
    });

export const retrieve_all_technician_entries: ServerQuery<
    void,
    (Technician | DataError)[]
> = ServerQuery.create_query(async (_, f_db) => {
    const context = "Retrieve All technician";
    let data;
    try {
        data = await get(f_db.access(tech_entries()));
    } catch {
        return new DataError(context + " - db connection error");
    }

    const technicians: (Technician | DataError)[] = [];

    if (data.exists()) {
        data.forEach((child) => {
            const tech = Technician.safeParse(child.val());
            if (tech.success) technicians.push(tech.data);
            else
                technicians.push(new DataError(context + " - corrupted entry"));
        });
    }

    return technicians;
});

export const update_technician_entry: ServerQuery<Technician, void> =
    ServerQuery.create_query(async (technician, f_db) => {
        try {
            await update(
                f_db.access(tech_entries(technician.id)),
                technician.login_claimed === undefined
                    ? {
                          name: technician.name,
                          color: technician.color,
                          active: technician.active,
                          login_claimed: null,
                      }
                    : {
                          name: technician.name,
                          color: technician.color,
                          active: technician.active,
                          login_claimed: technician.login_claimed,
                      },
            );
        } catch {
            return new DataError(
                "Updating Technician entry - db connection error",
            );
        }
    });

export const delete_technician_entry: ServerQuery<TechnicianId, void> =
    ServerQuery.create_query(async ({ tech_id }, f_db) => {
        try {
            await remove(f_db.access(tech_entries(tech_id)));
        } catch {
            return new DataError(
                `Deleting Technician entry ${tech_id} - db connection error`,
            );
        }
    });
