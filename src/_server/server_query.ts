import { FireDB } from "./fire_db";
import { DataError } from "./generic_query/data_error";
import { QueryData } from "./generic_query/query";

export type ServerQuery<T, U> = (
    t: T,
    f_db: FireDB,
) => Promise<U | DataError> | U | DataError;

export class ServerQueryData<T> {
    private query_data: QueryData<T>;
    private f_db: FireDB;

    private constructor(t: QueryData<T>, f_db: FireDB) {
        this.query_data = t;
        this.f_db = f_db;
    }

    static pack<T>(t: T, f_db: FireDB): ServerQueryData<T> {
        return new ServerQueryData(QueryData.pack(t), f_db);
    }

    bind<U>(query: ServerQuery<T, U>): ServerQueryData<U> {
        const q = this.query_data.bind((t: T) => query(t, this.f_db));
        return new ServerQueryData(q, this.f_db);
    }

    async unpack(): Promise<T | DataError> {
        return this.query_data.unpack();
    }
}
