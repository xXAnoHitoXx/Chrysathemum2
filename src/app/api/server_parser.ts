import { DataError, is_data_error } from "~/server/data_error";
import { Query, ServerQueryData } from "~/server/queries/server_queries_monad";

export type VoidReturn = {};

export function parse_request<T>(
    into: (t: unknown) => T | DataError,
): Query<Request, T> {
    return async (request: Request) => {
        return into(await request.json());
    };
}

export const handle_void_return: Query<void, VoidReturn> = () => ({});

export async function unpack_response<T>(
    data: ServerQueryData<T>,
): Promise<Response> {
    const t: T | DataError = await data.unpack();

    if (is_data_error(t)) {
        t.log();
        t.report();
        return new Response(t.message(), { status: 418 });
    }

    if (t == null) {
        return new Response();
    }

    return Response.json(t);
}
