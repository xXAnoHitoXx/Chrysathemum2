import 'server-only';

import { create_technician_entry, update_technician_entry } from '~/server/queries/crud/technician/technician_entry';
import type { Technician } from '~/server/db_schema/type_def';
import { db_query, Query } from '../../server_queries_monad';
import { DataSnapshot, equalTo, get, orderByChild, query } from 'firebase/database';
import { TechnicianCreationInfo } from '~/app/api/technician/create/validation';
import { assign_technician_to_location } from '../location/location';
import { DataError, is_data_error, lotta_errors, PartialResult } from '~/server/data_error';
import { to_technician } from '~/server/validation/db_types/technician_validation';

export const create_new_technician: Query<TechnicianCreationInfo, Technician> =
    async (data: TechnicianCreationInfo, f_db) => {
        const context = "Creating new Technician";

        const entry = await create_technician_entry({...data, active: false}, f_db);
        if(is_data_error(entry)) return entry.stack(context, "...");
        
        const assignment = assign_technician_to_location({
            location_id: data.active_salon,
            technician: entry,
        }, f_db);

        if(is_data_error(assignment)) return assignment.stack(context, "...")
        return assignment;
    }

export const mark_technician_active: Query<Technician, Technician> = 
    async (technician, f_db) => {
        if (technician.active) {
            return technician;
        }

        const active_tech: Technician = { 
            id: technician.id,  
            name: technician.name,
            color: technician.color,
            active: true,
        } 

        const update = await update_technician_entry(active_tech, f_db);
        if(is_data_error(update)) return update.stack("Mark Technician Inactive", technician.name);
        return active_tech;
    }

export const mark_technician_inactive: Query<Technician, Technician> = 
    async (technician, f_db) => {
        if (!technician.active) {
            return technician;
        }

        const inactive_tech: Technician = { 
            id: technician.id,  
            name: technician.name,
            color: technician.color,
            active: false,
        } 

        const update = await update_technician_entry(inactive_tech, f_db);
        if(is_data_error(update)) return update.stack("Mark Technician Inactive", technician.name);
        return inactive_tech;
    }

export const get_all_technicians: Query<void, PartialResult<Technician[]>> =
    async (_, f_db) => {
        const context = "Retrieve All technician";
        const data = await db_query(context, get(f_db.technician_entries([])));
        if(is_data_error(data)) return data;

        const technicians: Technician[] = [];
        const errors: DataError[] = [];

        if(data.exists()) {
            data.forEach((child) => {
                const tech = to_technician(child.val());
                if(is_data_error(tech)) {
                    errors.push(tech);
                } else {
                    technicians.push(tech);
                }
            });
        }

        return {
            data: technicians,
            error: (errors.length == 0)? null :
                lotta_errors(context, "some corupted entries", errors),
        };
    }

export const get_active_technicians: Query<void, Technician[]> =
    async (_, f_db) => {
        const data: DataSnapshot = await get(query(
            f_db.technician_entries([]),
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
