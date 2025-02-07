import { z } from "zod";
import { Customer } from "../customer/type_def";
import { Technician } from "../technician/type_def";

export const CustomerAppointmentIndex = z.object({
    customer_id: z.string(),
    date: z.string().date(),
    salon: z.string(),
    appointment_id: z.string(),
});
export type CustomerAppointmentIndex = z.infer<typeof CustomerAppointmentIndex>;

export const AppointmentRecordID = z.object({
    date: z.string().date(),
    salon: z.string(),
});
export type AppointmentRecordID = z.infer<typeof AppointmentRecordID>;

export const AppointmentID = z.object({
    date: z.string().date(),
    salon: z.string(),
    entry_id: z.string(),
});
export type AppointmentID = z.infer<typeof AppointmentID>;

export const AppointmentEntryCreationInfo = z.object({
    customer_id: z.string(),
    date: z.string().date(),
    time: z.number(),
    duration: z.number(),
    details: z.string(),
    salon: z.string(),
});
export type AppointmentEntryCreationInfo = z.infer<
    typeof AppointmentEntryCreationInfo
>;

export const AppointmentEntryUpdateInfo = z.object({
    id: AppointmentID,
    technician_id: z.optional(z.string()),
    time: z.number(),
    duration: z.number(),
    details: z.string(),
});
export type AppointmentEntryUpdateInfo = z.infer<
    typeof AppointmentEntryUpdateInfo
>;

export const AppointmentEntry = z.object({
    id: z.string(),
    customer_id: z.string(),
    technician_id: z.optional(z.string()),
    date: z.string().date(),
    time: z.number(),
    duration: z.number(),
    details: z.string(),
    salon: z.string(),
});
export type AppointmentEntry = z.infer<typeof AppointmentEntry>;

export const AppointmentCreationInfo = z.object({
    customer: Customer,
    date: z.string().date(),
    time: z.number(),
    duration: z.number(),
    details: z.string(),
    salon: z.string(),
});
export type AppointmentCreationInfo = z.infer<
    typeof AppointmentCreationInfo
>;

export const Appointment = z.object({
    id: z.string(),
    customer: Customer,
    technician: z.optional(Technician),
    date: z.string().date(),
    time: z.number(),
    duration: z.number(),
    details: z.string(),
    salon: z.string(),
});
export type Appointment = z.infer<typeof Appointment>;
