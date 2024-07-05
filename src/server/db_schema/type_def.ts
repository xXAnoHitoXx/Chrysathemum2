import "reflect-metadata"
import "es6-shim"

export const DEFAULT_VALUE = "default";

export type CustomerCreationInfo = {
    name: string, 
    phone_number: string,
}

export type CustomerUpdateData = {
    name: string | null, 
    phone_number: string | null,
    notes: string | null,
}

export type Customer = { 
    id: string, 
    name: string, 
    phone_number: string,
    notes: string,
}

export type Technician = { 
    id: string, 
    name: string, 
    color: string,
    active: boolean,
}

export type Location = { 
    id: string, 
    address: string 
}

export type Appointment = {
    id: string,
    customer: Customer,
    technician: Technician | null,
    date: string,
    time: number,
    duration: number,
    details: string,
}

export type AppointmentEntry = {
    id: string,
    customer_id: string,
    technician_id: string | null,
    date: string,
    time: number,
    duration: number,
    details: string,
}

export type Hour = { open: number, close: number };
export type Schedule = Hour[];
