import { z } from "zod";

export const LocationId = z.object({
    location_id: z.string(),
});
export type LocationId = z.infer<typeof LocationId>;

export const TechnicianId = z.object({
    tech_id: z.string(),
});
export type TechnicianId = z.infer<typeof TechnicianId>;

export const Technician = z.object({
    id: z.string(),
    name: z.string(),
    color: z.string(),
    active: z.boolean(),
    login_claimed: z.union([z.string(), z.undefined()]),
});

export type Technician = z.infer<typeof Technician>;

export const TechnicianCreationInfo = z.object({
    name: z.string(),
    color: z.string(),
    active_salon: z.string(),
});

export type TechnicianCreationInfo = z.infer<typeof TechnicianCreationInfo>;

export const TechnicianLogin = z.object({
    user_id: z.string(),
    tech_id: z.string(),
});

export type TechnicianLogin = z.infer<typeof TechnicianLogin>;

export const Roster = z.object({
    location_id: z.string(),
    technicians: z.array(Technician),
});

export type Roster = z.infer<typeof Roster>;

export const RosterAssignment = z.object({
    location_id: z.string(),
    technician: Technician,
});

export type RosterAssignment = z.infer<typeof RosterAssignment>;
