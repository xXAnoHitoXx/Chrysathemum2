import { type DataSnapshot, get, set, remove } from "firebase/database";
import { Query, QueryError } from "../../queries_monad";
import { FireDB } from "~/server/db_schema/fb_schema";
import { is_string } from "~/server/validation/simple_type";
import { server_error } from "~/server/server_error";

export const assign_technician_to_roster: 
    Query<
        { location_id: string, technician: { technician_id: string, color: string } },
        void
    > = async (
        { location_id, technician }: { location_id: string, technician: { technician_id: string, color: string } }, 
        f_db: FireDB
    ) => {
        await set(f_db.location_roster([location_id, technician.technician_id]), technician.color);
    }

export const retrieve_roster: Query<
    { location_id: string }, 
    { technician_id: string, color: string | QueryError }[]
> = async ({ location_id }: { location_id: string }, f_db: FireDB): 
    Promise<{ technician_id: string, color: string | QueryError }[]> => {
        const data: DataSnapshot = await get(f_db.location_roster([ location_id ]));
        const roster: { technician_id: string, color: string | QueryError }[] = [];

        if(data.exists()) {
            data.forEach((child) => {
                const color = child.val();
                if(is_string(color)){
                    roster.push({
                        technician_id: child.key,
                        color: color,
                    });
                } else {
                    roster.push({
                        technician_id: child.key,
                        color: server_error("corrupted technician entry in roster {".concat(child.key, "}"))
                    });
                }
            });
        }

        return roster;
    }

export const remove_technician_from_roster: Query< { location_id: string, technician_id: string }, void > = 
    async (  
        { location_id, technician_id }: { location_id: string, technician_id: string },
        f_db: FireDB
    ) => {
        await remove(f_db.location_roster([location_id, technician_id]))
    }
