import { type Old_Customer_Data, migrate_customer_data, import_customer_from_old_db } from "~/server/queries/migration/customer";
import { req_into_Old_Customer_Data } from "~/server/validation/migration/customer/customer_validation";
import { TypeConversionError } from "~/server/validation/validation_error";

export async function POST(request: Request): Promise<Response> {
    const old_customer: Old_Customer_Data | TypeConversionError = await req_into_Old_Customer_Data(request);

    if (old_customer instanceof TypeConversionError) {
        return Response.error();
    }

    await migrate_customer_data(old_customer);
    return new Response();
}

export async function GET(): Promise<Response> {
    const customers: Old_Customer_Data[] = await import_customer_from_old_db();
    return Response.json(customers);
}
