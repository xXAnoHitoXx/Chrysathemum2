import { DataError, is_data_error, report_partial_errors } from "./data_error";
import { FireDB } from "./fire_db";

export type ServerQueryData<T> = Promise<T | DataError> | T | DataError;

export type ServerQueryFunction<T, U> = (
    t: T,
    f_db: FireDB,
) => ServerQueryData<U>;

export type ServerQueryBuilder<T, U> = (
    t: T,
    f_db: FireDB,
) => ServerQuery<T, U>;

export function array_query<T, U>(
    q: ServerQueryFunction<T, U> | ServerQuery<T, U>,
): ServerQuery<T[], U[]> {
    const f = typeof q === "function" ? q : q.into_function();

    return ServerQuery.create_query<T[], ServerQueryData<U>[]>((arr, f_db) =>
        arr.map((t: T) => f(t, f_db)),
    )
        .chain<(U | DataError)[]>((arr) => Promise.all(arr))
        .chain<U[]>(report_partial_errors);
}

export abstract class ServerQuery<T, U> {
    abstract into_function(): ServerQueryFunction<T, U>;

    static from_data<U>(u: U): ServerQuery<any, U> {
        return ServerQuery.create_query(() => u);
    }

    static from_builder<T, U>(b: ServerQueryBuilder<T, U>): ServerQuery<T, U> {
        return ServerQuery.create_query((t, f_db) => b(t, f_db).call(t, f_db));
    }

    static create_query<T, U>(
        fn: ServerQueryFunction<T, U>,
    ): ServerQuery<T, U> {
        return new BaseQuery(fn);
    }

    chain<V>(
        q: ServerQueryFunction<U, V> | ServerQuery<U, V>,
    ): ServerQuery<T, V> {
        const f = typeof q === "function" ? q : q.into_function();
        return new CompositeQuery(this.into_function(), f);
    }

    call(t: T, f_db: FireDB): ServerQueryData<U> {
        return this.into_function()(t, f_db);
    }
}

class BaseQuery<T, U> extends ServerQuery<T, U> {
    private query_fn: ServerQueryFunction<T, U>;

    constructor(query_fn: ServerQueryFunction<T, U>) {
        super();
        this.query_fn = query_fn;
    }

    into_function() {
        return this.query_fn;
    }
}

class CompositeQuery<T, U, V> extends ServerQuery<T, V> {
    private q1: ServerQueryFunction<T, U>;
    private q2: ServerQueryFunction<U, V>;

    constructor(q1: ServerQueryFunction<T, U>, q2: ServerQueryFunction<U, V>) {
        super();
        this.q1 = q1;
        this.q2 = q2;
    }

    into_function() {
        return async (t: T, f_db: FireDB) => {
            const u = await this.q1(t, f_db);
            return is_data_error(u) ? u : this.q2(u, f_db);
        };
    }
}
