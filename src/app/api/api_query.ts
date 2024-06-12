import { ServerError, server_error } from "~/server/server_error";
import { TypeConversionError } from "~/server/validation/validation_error";

export enum Method {
    POST = "POST",
    GET = "GET",
    PATCH = "PATCH",
    DELETE = "DELETE",
}

export async function fetch_void_query({ url, method, params }: {
    url: string, 
    method: Method, 
    params: ({ data: unknown } | null),
}): Promise<ServerError | null> {
    const response = (params == null)? 
        await fetch(url, { method: method, }) :
        await fetch(url, { method: method, body: JSON.stringify(params.data), });

    if(!response.ok){
        return server_error(await response.text());
    }

    return null;
}

export async function fetch_query<T>({ url, method, params, to }: {
    url: string, 
    method: Method, 
    params: ({ data: unknown } | null),
    to: (t: unknown) => T | TypeConversionError
}): Promise<T | ServerError> {
    const response = (params == null)? 
        await fetch(url, { method: method, }) :
        await fetch(url, { method: method, body: JSON.stringify(params.data), });

    if(!response.ok){
        return server_error(await response.text());
    }

    return to(await response.json());
}

