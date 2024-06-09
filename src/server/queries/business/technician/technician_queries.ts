import 'server-only';
import { create_technician_entry, update_technician_entry } from '~/server/queries/crud/technician/technician_entry';
import type { Technician } from '~/server/db_schema/type_def';
import { Query, QueryError, ServerQueryData, map, retain_input } from '../../server_queries_monad';
import { is_server_error } from '~/server/server_error';

export const create_new_technician: Query<ServerQueryData<{ name: string, color: string }>, Technician> =
    async (data: ServerQueryData<{ name: string, color: string }>) => {
        return await data
            .bind(map(({ name, color }) => ({ name: name, color: color, active: false })))
            .bind(create_technician_entry)
            .unpack();
    }

export const mark_technician_active: Query<ServerQueryData<Technician>, Technician> = 
    async (data: ServerQueryData<Technician>): Promise<Technician | QueryError> => {
        return await data.bind(
            async (t: Technician) => {
                if(t.active) {
                    return t;
                }

                return await data.bind(map(
                    (t: Technician) => {
                        return { id: t.id, name: t.name, color: t.color, active: true };
                    }
                )).bind(retain_input(update_technician_entry)).unpack();
            }
        ).unpack();
    }

export const mark_technician_inactive: Query<ServerQueryData<Technician>, Technician> = 
    async (data: ServerQueryData<Technician>): Promise<Technician | QueryError> => {
        const technician: Technician | QueryError = await data.unpack();

        if(is_server_error(technician)) {
            return technician;
        }
    
        if(!technician.active) {
            return technician;
        }

        return await data.bind(map(
            (t: Technician) => {
                return { id: t.id, name: t.name, color: t.color, active: false };
            }
        )).bind(retain_input(update_technician_entry)).unpack();
    }

/*
export async function create_new_technician(
    { name, color }: { name: string, color: string }, 
    redirect = ""
): 
    Promise<Technician> 
{
    return await create_technician_entry({ name: name, color: color, active: true }, redirect);
}

export async function get_all_technicians(redirect = ""): Promise<Technician[]> {
    const data: DataSnapshot = await get(ref(f_db, fb_technician_entries(redirect)));

    const technicians: Technician[] = [];

    if(data.exists()) {
        data.forEach((child) => {
            technicians.push(child.val() as Technician);
        });
    }

    return technicians;
}

export async function get_active_technicians(redirect = ""): Promise<Technician[]> {
    const data: DataSnapshot = await get(query(
        ref(f_db, fb_technician_entries(redirect)), 
        orderByChild("active"), 
        equalTo(true)
    ));

    const technicians: Technician[] = [];

    if(data.exists()) {
        data.forEach((child) => {
            technicians.push(child.val() as Technician);
        });
    }

    return technicians;
}
*/
