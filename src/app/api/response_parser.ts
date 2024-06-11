import { QueryError, ServerQueryData } from "~/server/queries/server_queries_monad";
import { is_server_error } from "~/server/server_error";

export async function unpack_response<T>(data: ServerQueryData<T>): Promise<Response> {
    const t: T | QueryError = await data.unpack();
    if (is_server_error(t)) {
        return Response.error();
    }
    return Response.json(t);
}
