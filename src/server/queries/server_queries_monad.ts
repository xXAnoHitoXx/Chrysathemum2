import { data_error, DataError, is_data_error } from "../data_error";
import { FireDB } from "../db_schema/fb_schema";

export type Query<T, U> = (
    t: T,
    fire_db: FireDB,
) => Promise<U | DataError> | U | DataError;

export abstract class ServerQueryData<T> {
    protected fire_db: FireDB;
    protected is_test: boolean;

    abstract unpack(): Promise<T | DataError>;

    constructor(fire_db: FireDB, is_test: boolean) {
        this.fire_db = fire_db;
        this.is_test = is_test;
    }

    bind<U>(query: Query<T, U>): ServerQueryData<U> {
        return new ChainedQueryData(this, query, this.fire_db, this.is_test);
    }

    err_bind<U>(query: Query<DataError, U>): ServerQueryData<T | U> {
        return new ErrQueryData(this, query, this.fire_db, this.is_test);
    }
}

export function pack<T>(data: T): ServerQueryData<T> {
    return new SimpleQueryData(data, new FireDB(), false);
}

export function pack_test<T>(data: T, test_name: string): ServerQueryData<T> {
    return new SimpleQueryData(data, new FireDB(test_name), true);
}

export async function db_query<T>(
    context: string,
    promise: Promise<T>,
): Promise<T | DataError> {
    return promise.catch(() => data_error(context, "database error"));
}

export function map<T, U>(mapper: (t: T) => U): Query<T, U> {
    return async (t: T, _): Promise<U> => {
        return mapper(t);
    };
}

class SimpleQueryData<T> extends ServerQueryData<T> {
    private data: T | DataError;

    constructor(data: T | DataError, fire_db: FireDB, is_test: boolean) {
        super(fire_db, is_test);
        this.data = data;
        this.fire_db = fire_db;
        this.is_test = is_test;
    }

    async unpack(): Promise<T | DataError> {
        return this.data;
    }
}

class NOTHING {}

class ChainedQueryData<S, T> extends ServerQueryData<T> {
    private data: ServerQueryData<S>;
    private query: Query<S, T>;
    private output: T | DataError | NOTHING;

    constructor(
        data: ServerQueryData<S>,
        query: Query<S, T>,
        fire_db: FireDB,
        is_test: boolean,
    ) {
        super(fire_db, is_test);
        this.data = data;
        this.query = query;
        this.fire_db = fire_db;
        this.is_test = is_test;
        this.output = new NOTHING();
    }

    async unpack(): Promise<T | DataError> {
        if (this.output instanceof NOTHING) {
            const data: S | DataError = await this.data.unpack();

            if (is_data_error(data)) {
                return data;
            }

            const ret: T | DataError = await this.query(data, this.fire_db);
            this.output = ret;
            return ret;
        }

        return this.output;
    }
}

class ErrQueryData<S, T> extends ServerQueryData<T | S> {
    private data: ServerQueryData<T>;
    private query: Query<DataError, S>;
    private output: T | S | DataError | NOTHING;

    constructor(
        data: ServerQueryData<T>,
        query: Query<DataError, S>,
        f_db: FireDB,
        is_test: boolean,
    ) {
        super(f_db, is_test);
        this.data = data;
        this.query = query;
        this.output = new NOTHING();
    }

    async unpack(): Promise<T | S | DataError> {
        if (this.output instanceof NOTHING) {
            const data: T | DataError = await this.data.unpack();

            if (!is_data_error(data)) {
                return data;
            }

            const ret: S | DataError = await this.query(data, this.fire_db);
            this.output = ret;
            return ret;
        }

        return this.output;
    }
}
