import { QueryError, ServerQueryData } from "~/server/queries/server_queries_monad";
import { ServerError, is_server_error, server_error } from "~/server/server_error";
import { TypeConversionError } from "~/server/validation/validation_error";

export async function unpack_response<T>(data: ServerQueryData<T>): Promise<Response> {
    const t: T | QueryError = await data.unpack();
    if (is_server_error(t)) {
        return new Response(t.error.message, { status: 418 });
    }
    return Response.json(t);
}

export async function parse<T>(response: Response, to: (t: unknown) => T | TypeConversionError): Promise<T | ServerError> {
    if(!response.ok){
        return server_error(await response.text());
    }
    return to(await response.json());
}
