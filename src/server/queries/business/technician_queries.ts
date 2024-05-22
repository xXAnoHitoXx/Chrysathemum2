import 'server-only';
import { create_technician_entry, update_technician_entry } from './../crud/technician/technician_entry';
import { fb_technician_entries } from '~/server/db_schema/fb_schema';
import { type DataSnapshot, get, ref, query, orderByChild, equalTo } from 'firebase/database';
import { f_db } from '~/server/db_schema';
import type { Technician } from '~/server/db_schema/type_def';

export async function create_new_technician(
    { name, color }: { name: string, color: string }, 
    redirect = ""
): 
    Promise<Technician> 
{
    return await create_technician_entry({ name: name, color: color, active: true }, redirect);
}

export async function mark_technician_inactive(technician: Technician, redirect = "") {
    if(!technician.active){
        return;
    }

    technician.active = false;
    await update_technician_entry(technician, redirect);
}

export async function mark_technician_active(technician: Technician, redirect = "") {
    if(technician.active){
        return;
    }

    technician.active = true;
    await update_technician_entry(technician, redirect);
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
