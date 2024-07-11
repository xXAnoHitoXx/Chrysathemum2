import { data_error, DataError, is_data_error } from "../data_error";
import { FireDB } from "../db_schema/fb_schema";

export type Query<T, U> = (t: T, fire_db: FireDB) => (Promise<U | DataError> | U | DataError);

export interface ServerQueryData<T> {
    unpack(): Promise<T | DataError>;
    bind<U>(query: Query<T, U>): ServerQueryData<U>;
    packed_bind<U>(query: Query<ServerQueryData<T>, U>): ServerQueryData<U>;
}

export function pack<T>(data: T): ServerQueryData<T> {
    return new SimpleQueryData(data, new FireDB(), false);
}

export function pack_test<T>(data: T, test_name: string): ServerQueryData<T> {
    return new SimpleQueryData(data, new FireDB(test_name), true);
}

export async function db_query<T>(context: string, promise: Promise<T>): Promise<T | DataError> {
    return promise.catch(()=> (data_error(context, "database error")))
}

export function merge<R, S, T>(
    r: ServerQueryData<R>,
    s: ServerQueryData<S>,
    merger: (r: R, s: S) => T | DataError
): ServerQueryData<T> {
    return r.bind(async (r: R, _): Promise<T | DataError> => {
        return s.bind(async (s: S, _): Promise<T | DataError> => {
            return merger(r, s);
        }).unpack();
    });
}

export function map<T, U>(mapper: (t: T) => U): Query<T, U> {
    return async (t: T, _): Promise<U> => {
        return mapper(t);
    }
}

export function retain_input_n_output<T, U, V>(
    query: Query<T, U>, 
    packer: (input: T, output: U) => V | DataError
): Query<T, V> {
    return async (t: T, fire_db: FireDB) => {
        const u = await query(t, fire_db);
        if (is_data_error(u)) {
            return u;
        }
        return packer(t, u);
    }
}

export function retain_input<T, U>(query: Query<T, U>): Query<T, T> {
    return async (t: T, fire_db: FireDB) => {
        const err: DataError | U = await query(t, fire_db);
        if (is_data_error(err)){
            return err;
        }
        return t;
    }
}

class SimpleQueryData<T> implements ServerQueryData<T> {
    private data: T | DataError; 
    private fire_db: FireDB;
    private is_test: boolean;

    constructor(data: T | DataError, fire_db: FireDB, is_test: boolean) {
        this.data = data;
        this.fire_db = fire_db;
        this.is_test = is_test;
    }

    async unpack(): Promise<T | DataError> {
        return this.data;
    }

    bind<U>(query: Query<T, U>): ServerQueryData<U> {
        return new ChainedQueryData<T, U>(this, query, this.fire_db, this.is_test);
    }

    packed_bind<U>(query: Query<ServerQueryData<T>, U>): ServerQueryData<U> {
        const packed_data = new SimpleQueryData(this, this.fire_db, this.is_test);
        return packed_data.bind(query);
    }
}

class NOTHING {}

class ChainedQueryData<S, T> implements ServerQueryData<T> {
    private data: ServerQueryData<S>; 
    private query: Query<S, T>;
    private fire_db: FireDB;
    private is_test: boolean;
    private output: T | DataError | NOTHING;

    constructor(data: ServerQueryData<S>, query: Query<S, T>, fire_db: FireDB, is_test: boolean) {
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

    bind<U>(query: Query<T, U>): ServerQueryData<U> {
        return new ChainedQueryData<T, U>(this, query, this.fire_db, this.is_test);
    }

    packed_bind<U>(query: Query<ServerQueryData<T>, U>): ServerQueryData<U> {
        const packed_data = new SimpleQueryData(this, this.fire_db, this.is_test);
        return packed_data.bind(query);
    }
}
