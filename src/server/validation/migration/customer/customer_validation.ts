import { type Old_Customer_Data } from "~/server/queries/migration/customer";
import { TypeConversionError } from "../../validation_error";
import { plainToInstance } from "class-transformer";

class OldCustomerValidatior {
    id: string | undefined;
    name: string | undefined;
    phoneNumber: string | undefined;

    into_Old_Customer_Data(): Old_Customer_Data | TypeConversionError {
        if (this.id == undefined) {
            return new TypeConversionError("Customer Data Missing id");
        }

        if (this.name == undefined) {
            return new TypeConversionError("Customer Data Missing name");
        }

        if (this.phoneNumber == undefined) {
            return new TypeConversionError("Customer Data Missing phoneNumber");
        }

        return { id: this.id, name: this.name, phoneNumber: this.phoneNumber };
    }
}

export async function req_into_Old_Customer_Data(request: Request): Promise<Old_Customer_Data | TypeConversionError> {
    const conv: OldCustomerValidatior = plainToInstance(OldCustomerValidatior, await request.json());
    return conv.into_Old_Customer_Data();
}

export async function res_into_Old_Customer_Data(response: Response): Promise<(Old_Customer_Data | TypeConversionError)[]> {
    const conv: OldCustomerValidatior[] = plainToInstance(OldCustomerValidatior, await response.json() as OldCustomerValidatior[]);
    return conv.map((validator) => (validator.into_Old_Customer_Data()));
}

