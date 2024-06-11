import 'server-only';
import { create_technician_entry, update_technician_entry } from '~/server/queries/crud/technician/technician_entry';
import type { Technician } from '~/server/db_schema/type_def';
import { Query, QueryError, ServerQueryData, map, retain_input } from '../../server_queries_monad';
import { FireDB } from '~/server/db_schema/fb_schema';
import { DataSnapshot, get } from 'firebase/database';

export const create_new_technician: Query<ServerQueryData<{ name: string, color: string }>, Technician> =
    async (data: ServerQueryData<{ name: string, color: string }>) => {
        return await data
            .bind(map(({ name, color }) => ({ name: name, color: color, active: false })))
            .bind(create_technician_entry)
            .unpack();
    }

export const mark_technician_active: Query<Technician, Technician> = 
    async (technician: Technician, f_db: FireDB): Promise<Technician | QueryError> => {
        if (technician.active) {
            return technician;
        }

        const active_tech: Technician = { 
            id: technician.id,  
            name: technician.name,
            color: technician.color,
            active: true,
        } 

        const update = retain_input(update_technician_entry);
        return update(active_tech, f_db);
    }

export const mark_technician_inactive: Query<Technician, Technician> = 
    async (technician: Technician, f_db: FireDB): Promise<Technician | QueryError> => {
        if (technician.active) {
            return technician;
        }

        const inactive_tech: Technician = { 
            id: technician.id,  
            name: technician.name,
            color: technician.color,
            active: false,
        } 

        const update = retain_input(update_technician_entry);
        return update(inactive_tech, f_db);
    }

export const get_all_technicians: Query<void, Technician[]> =
    async (_: void, f_db: FireDB) => {
        const data: DataSnapshot = await get(f_db.technician_entries([]));

        const technicians: Technician[] = [];

        if(data.exists()) {
            data.forEach((child) => {
                technicians.push(child.val() as Technician);
            });
        }

        return technicians;
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
