import type { Technician, TechnicianCreationInfo } from "~/server/db_schema/type_def"
import { create_new_technician } from "~/server/queries/business/technician_queries";
import { into_technician_creation_info } from "~/server/validation/technician_validation"
import { TypeConversionError } from "~/server/validation/validation_error";

export async function POST(request: Request): Promise<Response> {
    const tech_info: TechnicianCreationInfo | TypeConversionError = await into_technician_creation_info(request);

    if (tech_info instanceof TypeConversionError) {
        return Response.error();
    }

    const tech: Technician = await create_new_technician({ name: tech_info.name, color: tech_info.color });

    return Response.json(tech);
}
