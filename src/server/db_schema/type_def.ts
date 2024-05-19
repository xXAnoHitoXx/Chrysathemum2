import "reflect-metadata"
import "es6-shim"

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
};

export type TechnicianCreationInfo = {
    name: string,
    color: string,
    active_salon: string,
}

export type Location = { 
    id: string, 
    address: string 
};

