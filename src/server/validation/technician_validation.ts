import "reflect-metadata"
import "es6-shim"
import { plainToClass } from "class-transformer"
import type { Technician, TechnicianCreationInfo } from "../db_schema/type_def"
import { TypeConversionError } from "./validation_error"

class TechConversion {
    id: string | undefined;
    name: string | undefined;
    color: string | undefined;
    active: boolean | undefined;
    
    into_technician_creation_info(): TechnicianCreationInfo | TypeConversionError {
        if (this.name == undefined){
            return new TypeConversionError("technician must have name");
        }

        if (this.color == undefined) {
            return new TypeConversionError("technician must have color");
        }

        return {
            name: this.name,
            color: this.color,
        }
    }

    into_technician(): Technician | TypeConversionError {
        
        if (this.id == undefined){
            return new TypeConversionError("undefined technician id");
        } 

        if (this.name == undefined){
            return new TypeConversionError("undefined technician name");
        }

        if (this.color == undefined) {
            return new TypeConversionError("undefined technician color");
        }

        if (this.active == undefined) {
            return new TypeConversionError("undefined technician active");
        }

        return {
            id: this.id,
            name: this.name,
            color: this.color,
            active: this.active,
        }
    }
}

export async function into_technician(response: Response): Promise<Technician | TypeConversionError> {
    const conv: TechConversion = plainToClass(TechConversion, await response.json());
    return conv.into_technician();
}

export async function into_technician_creation_info(request: Request): Promise<TechnicianCreationInfo | TypeConversionError> {
    const conv: TechConversion = plainToClass(TechConversion, await request.json());
    return conv.into_technician_creation_info();
}
