import type { Technician } from "~/server/db_schema/type_def"
import { mark_technician_inactive } from "~/server/queries/business/technician_queries";
import { req_into_technician } from "~/server/validation/technician_validation";
import { TypeConversionError } from "~/server/validation/validation_error";

export async function PATCH(request: Request): Promise<Response> {
    const technician: Technician | TypeConversionError = await req_into_technician(request);

    if (technician instanceof TypeConversionError) {
        return Response.error();
    }

    await mark_technician_inactive(technician);

    return new Response();
}
