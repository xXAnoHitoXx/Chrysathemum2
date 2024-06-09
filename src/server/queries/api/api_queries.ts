import { QueryError, ServerQueryData } from "../server_queries_monad";

export type API_Query<T, U> = (data: ServerQueryData<T>) => Promise<ServerQueryData<U>>;

export async function execute_api_query<T, U>(query: API_Query<T, U>, t: ServerQueryData<T>,): Promise<U | QueryError> {
    const res = await query(t);
    return await res.unpack();
} 
