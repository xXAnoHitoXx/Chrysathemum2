import { TypeConversionError } from "~/server/validation/validation_error";
import { parse_response, ResponseError } from "./response_parser";

export enum Method {
    POST = "POST",
    GET = "GET",
    PATCH = "PATCH",
    DELETE = "DELETE",
}

export async function fetch_query<T>({ url, method, params, to }: {
    url: string, 
    method: Method, 
    params: ({ data: unknown } | null),
    to: (t: unknown) => T | TypeConversionError,
}): Promise<T | ResponseError> {
    const response = (params == null)? 
        await fetch(url, { method: method, }) :
        await fetch(url, { method: method, body: JSON.stringify(params.data), });

    return parse_response(response, to);
}
