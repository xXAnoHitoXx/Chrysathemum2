
import type { Technician } from "~/server/db_schema/type_def"
import { assign_technician_to_location, remove_technician_from_location } from "~/server/queries/business/location";
import { req_into_technician } from "~/server/validation/technician_validation"
import { TypeConversionError } from "~/server/validation/validation_error";

export async function POST(request: Request, { params }: { params: { salon: string } } ): Promise<Response> {
    const technician: Technician | TypeConversionError = await req_into_technician(request);

    if (technician instanceof TypeConversionError) {
        return Response.error();
    }

    await assign_technician_to_location({ location_id: params.salon, technician: technician });
    return new Response();
}

export async function DELETE(request: Request, { params }: { params: { salon: string } } ): Promise<Response> {
    const technician: Technician | TypeConversionError = await req_into_technician(request);

    if (technician instanceof TypeConversionError) {
        return Response.error();
    }

    await remove_technician_from_location({ location_id: params.salon, technician_id: technician.id});
    return new Response();
}
