import { Query } from "~/server/queries/server_queries_monad";
import { TypeConversionError } from "~/server/validation/validation_error";

export function parse_request<T>(into: (t: unknown) => T | TypeConversionError): Query<Request, T> {
    return async (request: Request): Promise<T | TypeConversionError> => {
        return into(await request.json());
    }
}
