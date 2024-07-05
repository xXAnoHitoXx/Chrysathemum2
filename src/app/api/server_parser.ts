import { Query, QueryError, ServerQueryData } from "~/server/queries/server_queries_monad";
import { ServerError, is_server_error, server_error } from "~/server/server_error";
import { TypeConversionError, is_type_conversion_error } from "~/server/validation/validation_error";

export function parse_request<T>(into: (t: unknown) => T | TypeConversionError): Query<Request, T> {
    return async (request: Request): Promise<T | ServerError> => {
        const req = into( await request.json());
        return is_type_conversion_error(req)? server_error(req.error) : req;
    }
}

export async function unpack_response<T>(data: ServerQueryData<T>): Promise<Response> {
    const t: T | QueryError = await data.unpack();
    if (is_server_error(t)) {
        return new Response(t.error, { status: 418 });
    }

    if(t == null) {
        return new Response();
    }

    return Response.json(t);
}
